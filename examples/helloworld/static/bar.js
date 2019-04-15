// document.window.test_foo += 1

replaceme = document.body.getElementsByClassName('replaceme')[0]
if (document.test_foo !== 1) {
  replaceme.innerHTML = 'Your scripts are incredibly not in order!'
} else {
  replaceme.innerHTML = 'Your scripts are superbly order!'
}
