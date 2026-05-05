#!/usr/bin/env node
/**
 * Cordova hook: after_prepare
 * Fixes IPHONEOS_DEPLOYMENT_TARGET from 11.0 → 13.0 in all iOS xcodeproj files.
 * Needed because cordova-ios regenerates project.pbxproj with 11.0 on every prepare,
 * and Xcode 26+ requires a minimum of 12.0 (we use 13.0 for UIScene support).
 */

const fs = require('fs');
const path = require('path');

module.exports = function (context) {
  if (!context.opts.platforms.includes('ios')) return;

  const pbxprojPaths = [
    path.join(context.opts.projectRoot, 'platforms/ios/App.xcodeproj/project.pbxproj'),
    path.join(context.opts.projectRoot, 'platforms/ios/packages/cordova-ios/CordovaLib/CordovaLib.xcodeproj/project.pbxproj'),
  ];

  for (const filePath of pbxprojPaths) {
    if (!fs.existsSync(filePath)) continue;
    const original = fs.readFileSync(filePath, 'utf8');
    const fixed = original.replace(/IPHONEOS_DEPLOYMENT_TARGET = 11\.0/g, 'IPHONEOS_DEPLOYMENT_TARGET = 13.0');
    if (fixed !== original) {
      fs.writeFileSync(filePath, fixed, 'utf8');
      console.log(`[hook] Fixed deployment target in: ${path.basename(path.dirname(filePath))}`);
    }
  }
};
