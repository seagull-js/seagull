import { CopyFile } from './copy_file'
import { CopyFolder } from './copy_folder'
import { CreateFolder } from './create_folder'
import { DeleteFile } from './delete_file'
import { DeleteFolder } from './delete_folder'
import { Exists } from './exists'
import { FSSandbox } from './fs_sandbox'
import { ListFiles } from './list_files'
import { ReadFile } from './read_file'
import { WriteFile } from './write_file'

export const FS = {
  CopyFile,
  CopyFolder,
  CreateFolder,
  DeleteFile,
  DeleteFolder,
  Exists,
  ListFiles,
  ReadFile,
  WriteFile,
}
export { FSSandbox }
