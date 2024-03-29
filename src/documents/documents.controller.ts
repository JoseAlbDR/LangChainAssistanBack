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

@Controller('document')
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
    @Body() documentOptions: DocumentOptionsDto,
  ) {
    return await this.documentsService.create(document, documentOptions);
  }

  @Get()
  findAll() {
    return this.documentsService.findAll();
  }

  @Get(':name')
  findOne(@Param('name') name: string) {
    return this.documentsService.findOne(name);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateDocumentDto: UpdateDocumentDto) {
  //   return this.documentsService.update(+id, updateDocumentDto);
  // }

  @Delete(':name')
  remove(@Param('name') name: string) {
    return this.documentsService.remove(name);
  }
}
