import { DeleteFile } from './delete_file'
import { ListFiles } from './list_files'
import { ReadFile } from './read_file'
import { WriteFile } from './write_file'

export * from './s3_sandbox'

export const S3 = {
  DeleteFile,
  ListFiles,
  ReadFile,
  WriteFile,
}
