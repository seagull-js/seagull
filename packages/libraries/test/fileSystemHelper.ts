import 'chai/register-should'
import { createFsFromVolume, fs as memfs, Volume } from 'memfs'
import { suite, test } from 'mocha-typescript'
import { copyFolderRecursive, removeFolderRecursive } from '../src'

@suite('Library::FileSystemHelper')
export class Test {
  @test
  async 'delete folder recursively'() {
    const volume = new Volume()
    const fs = createFsFromVolume(volume)

    fs.mkdirSync('/tmp')
    fs.mkdirSync('/tmp/dir')
    fs.writeFileSync('/tmp/dir/index.html', '')
    fs.mkdirSync('/tmp/dir/dir')
    fs.writeFileSync('/tmp/dir/dir/index.html', '')
    removeFolderRecursive('/tmp/dir', fs as any)
    const list = fs.readdirSync('/tmp')
    list.should.not.include('dir')
  }

  @test
  async 'copies folder recursively'() {
    const volume = new Volume()
    const fs = createFsFromVolume(volume)
    fs.mkdirSync('/tmp')
    fs.mkdirSync('/tmp/a')
    fs.writeFileSync('/tmp/a/index.html', '')
    fs.mkdirSync('/tmp/a/a')
    fs.writeFileSync('/tmp/a/a/index.html', '')
    copyFolderRecursive('/tmp/a', '/tmp/b', fs as any)
    fs.existsSync('/tmp/b/index.html').should.be.equal(true)
    fs.existsSync('/tmp/b/a/index.html').should.be.equal(true)
  }
}
