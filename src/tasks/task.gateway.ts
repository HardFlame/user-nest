import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { TasksService } from './task.service';
import type {
  TaskNestUncheckedCreateInput,
  TaskNestUncheckedUpdateInput,
} from 'src/generated/prisma/models';
import { userInJwtDto } from 'src/auth/dto/login.dto';
import { type Request as RequestType } from 'express';
import { Logger, Request, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtAuthGuard } from 'src/jwt/jwt-auth.guard';
import { OnEvent } from '@nestjs/event-emitter';

@WebSocketGateway()
export class TasksGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private logger = new Logger(TasksGateway.name);
  @WebSocketServer() server: Server;

  constructor(private readonly tasksService: TasksService) {}

  handleConnection(client: Socket) {
    this.logger.log('connected: ' + client.id);
  }

  handleDisconnect(client: Socket) {
    this.logger.log('disconnected: ' + client.id);
  }

  @SubscribeMessage('findAllTasks')
  async findAll() {
    const tasks = await this.tasksService.tasks({});
    return tasks;
  }

  @SubscribeMessage('findOneTask')
  async findOne(@MessageBody() id: number) {
    const task = await this.tasksService.task({ id: +id });
    return task;
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('createTask')
  async create(
    @MessageBody() createTaskDto: TaskNestUncheckedCreateInput,
    @Request() req: { user: userInJwtDto },
  ) {
    const task = await this.tasksService.createTask(createTaskDto, req);
    return task;
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('updateTask')
  async update(
    @MessageBody() updateTaskDto: TaskNestUncheckedUpdateInput,
    @Request() req: RequestType,
  ) {
    if (typeof updateTaskDto.id !== 'number') {
      throw new WsException('Task.id is requred');
    }
    const task = await this.tasksService.updateTask({
      where: { id: updateTaskDto.id },
      data: updateTaskDto,
      req,
    });
    return task;
  }

  @UseGuards(JwtAuthGuard)
  @SubscribeMessage('removeTask')
  async remove(@MessageBody() id: number) {
    const task = await this.tasksService.deleteTask({ id: +id });
    return task;
  }

  @OnEvent('Task.created')
  private emitCreate(task) {
    this.server.emit('created Task', task);
  }

  @OnEvent('Task.updated')
  private emitUpdate(task) {
    this.server.emit('updated Task', task);
  }

  @OnEvent('Task.removed')
  private emitRemove(task) {
    this.server.emit('removed Task', task);
  }
}
