import {
  Controller,
  Get,
  Post,
  Param,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  Delete,
  Body,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentOptionsDto } from './dtos/document-options.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from '@prisma/client';

@Controller('document')
@Auth()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('document'))
  async feedDocument(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: /(text|pdf)/ })],
      }),
    )
    document: Express.Multer.File,
    @GetUser('id') user: User,
    @Body() documentOptions: DocumentOptionsDto,
  ) {
    return await this.documentsService.create(
      document,
      documentOptions,
      user.id,
    );
  }

  @Get()
  findAll(@GetUser('id') user: User) {
    return this.documentsService.findAll(user.id);
  }

  @Get(':name')
  findOne(@Param('name') name: string, @GetUser('id') user: User) {
    return this.documentsService.findOne(name, user);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto) {
  //   return this.documentsService.update(+id, updateDocumentDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.documentsService.remove(id, user);
  }
}
