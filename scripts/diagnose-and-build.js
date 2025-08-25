import { execSync } from 'node:child_process'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

function safeExec(command) {
  try {
    return execSync(command, { stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim()
  } catch (error) {
    return `ERR: ${error?.message || 'unknown error'}`
  }
}

function logSection(title) {
  console.log(`\n=== ${title} ===`)
}

try {
  logSection('ENVIRONMENT')
  console.log('CWD:', process.cwd())
  console.log('Node:', process.version)
  console.log('NPM:', safeExec('npm -v'))

  logSection('FILES IN CWD')
  try {
    console.log(readdirSync('.').join('  '))
  } catch (e) {
    console.log('Unable to list files:', e?.message)
  }

  logSection('PACKAGE IN CWD')
  try {
    const pkgRaw = readFileSync('package.json', 'utf8')
    const pkg = JSON.parse(pkgRaw)
    console.log('package.json name:', pkg?.name)
    console.log('scripts:', Object.keys(pkg?.scripts || {}).join('  '))
    if (!pkg?.scripts?.['build:vercel']) {
      console.log('NOTE: build:vercel script NOT found in this directory')
    }
  } catch (e) {
    console.log('No package.json in current directory')
  }

  logSection('PACKAGE IN PARENT (if any)')
  if (existsSync(path.join('..', 'package.json'))) {
    try {
      const parentPkgRaw = readFileSync(path.join('..', 'package.json'), 'utf8')
      const parentPkg = JSON.parse(parentPkgRaw)
      console.log('parent package.json name:', parentPkg?.name)
      console.log('parent scripts:', Object.keys(parentPkg?.scripts || {}).join('  '))
      console.log('parent has build:vercel:', Boolean(parentPkg?.scripts?.['build:vercel']))
    } catch (e) {
      console.log('Unable to read parent package.json:', e?.message)
    }
  } else {
    console.log('No parent package.json found')
  }

  logSection('RUN BUILD')
  // This will run whatever build:vercel is available in the current working directory
  // If the build runs from backend/, our passthrough script will delegate to root
  execSync('npm run build:vercel', { stdio: 'inherit' })
} catch (error) {
  console.error('\nBuild failed:', error?.message || error)
  process.exit(typeof error?.status === 'number' ? error.status : 1)
} 