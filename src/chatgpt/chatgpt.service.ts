import { Injectable } from '@nestjs/common';
import { CreateChatgptDto } from './dto/user-question.dto';
import { UpdateChatgptDto } from './dto/update-chatgpt.dto';

@Injectable()
export class ChatgptService {
  create(createChatgptDto: CreateChatgptDto) {
    return 'This action adds a new chatgpt';
  }

  findAll() {
    return `This action returns all chatgpt`;
  }

  findOne(id: number) {
    return `This action returns a #${id} chatgpt`;
  }

  update(id: number, updateChatgptDto: UpdateChatgptDto) {
    return `This action updates a #${id} chatgpt`;
  }

  remove(id: number) {
    return `This action removes a #${id} chatgpt`;
  }
}
