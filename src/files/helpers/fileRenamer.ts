export const fileRenamer = (
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error, filename: string) => void,
): void => {
  if (!file) return callback(new Error('No file provided'), null);
  const extension = file.originalname.split('.').pop();
  const filename = `${Date.now()}.${extension}`;
  callback(null, filename);
};
