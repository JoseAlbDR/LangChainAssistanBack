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
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Auth()
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

  @Auth()
  @Get()
  findAll(@GetUser('id') user: User) {
    return this.documentsService.findAll(user.id);
  }

  @Auth()
  @Get(':name')
  findOne(@Param('name') name: string, @GetUser('id') user: User) {
    return this.documentsService.findOne(name, user.id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto) {
  //   return this.documentsService.update(+id, updateDocumentDto);
  // }

  @Auth()
  @Delete(':name')
  remove(@Param('name') name: string, @GetUser() user: User) {
    return this.documentsService.remove(name, user);
  }
}
