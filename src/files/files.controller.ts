import { Param, StreamableFile } from '@nestjs/common';
import { BadRequestException, Get, Header, HttpStatus } from '@nestjs/common';
import { ParseFilePipeBuilder, UseInterceptors } from '@nestjs/common';
import { Controller, Post, UploadedFile } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { createReadStream } from 'fs';
import { diskStorage } from 'multer';
import { FilesService } from './files.service';
import { fileRenamer } from './helpers/fileRenamer';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Get('product/:filename')
  @Header('Content-Type', 'image/jpeg')
  getProductImage(@Param('filename') filename: string) {
    const image = this.filesService.getProductImage(filename);
    const stream = createReadStream(image);
    return new StreamableFile(stream);
  }

  @Post('upload') // product
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        // si no hi poso el path sencer, intenta fer-ho al root del FS i peta.
        // també funciona amb path relatiu
        destination: './static/products',
        filename: fileRenamer,
      }),
    }),
  )
  uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'jpeg',
        })
        .addMaxSizeValidator({
          maxSize: 1000000,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    console.log(file);
    /*if (!file) throw new BadRequestException('Image File is required');
    const secureUrl = `${this.configService.get('HOST_API')}/files/product/${
      file.filename
    }`;
    return { fileName: secureUrl };*/
    return { fileName: file.filename };
  }
}
