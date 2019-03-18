import 'chai/register-should'
import { createFsFromVolume, fs as memfs, Volume } from 'memfs'
import { suite, test } from 'mocha-typescript'
import {
  copyFolderRecursive,
  listFilesRecursive,
  removeFolderRecursive,
} from '../src'

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

  @test
  async 'list files does return empty array if no target folder is found'() {
    const volume = new Volume()
    const fs = createFsFromVolume(volume)
    fs.mkdirSync('/tmp')
    const list = listFilesRecursive('/tmp/unknwon', fs as any)
    list.should.be.an('array')
    list.length.should.be.equal(0)
  }

  @test
  async 'list files does return empty array if target folder is empty'() {
    const volume = new Volume()
    const fs = createFsFromVolume(volume)
    fs.mkdirSync('/tmp')
    const list = listFilesRecursive('/tmp', undefined, fs as any)
    list.should.be.an('array')
    list.length.should.be.equal(0)
  }

  @test
  async 'list files does return empty array if target folder is not found'() {
    const volume = new Volume()
    const fs = createFsFromVolume(volume)
    fs.mkdirSync('/tmp')
    const list = listFilesRecursive('/tmp/non-existent', undefined, fs as any)
    list.should.be.an('array')
    list.length.should.be.equal(0)
  }

  @test
  async 'list files does return array with one element if no target is a file'() {
    const volume = new Volume()
    const fs = createFsFromVolume(volume)
    fs.mkdirSync('/tmp')
    fs.writeFileSync('/tmp/index.html', '')
    const list = listFilesRecursive('/tmp/index.html', undefined, fs as any)
    list.should.be.an('array')
    list.length.should.be.equal(1)
    list.should.have.members(['/tmp/index.html'])
  }

  @test
  async 'list files does return file array if target folder is found'() {
    const volume = new Volume()
    const fs = createFsFromVolume(volume)
    fs.mkdirSync('/tmp')
    fs.writeFileSync('/tmp/index.html', '')
    fs.mkdirSync('/tmp/a')
    fs.writeFileSync('/tmp/a/index.html', '')
    const list = listFilesRecursive('/tmp', undefined, fs as any)
    list.should.be.an('array')
    list.should.have.members(['/tmp/index.html', '/tmp/a/index.html'])
  }

  @test
  async 'list files can apply filter pattern to result list optionally'() {
    const volume = new Volume()
    const fs = createFsFromVolume(volume)
    fs.mkdirSync('/tmp')
    fs.writeFileSync('/tmp/index.html', '')
    fs.writeFileSync('/tmp/index.js', '')
    const list = listFilesRecursive('/tmp', /html$/, fs as any)
    list.should.be.an('array')
    list.should.have.members(['/tmp/index.html'])
  }
}
