#!/usr/bin/env node
"use strict";
const { execSync } = require("child_process");
const path = require("path");
const url = "http://localhost:3000";
const viewport = "430,932";

// Playwright Chromium: opens an interactive browser at 430x932 (mobile viewport).
execSync(
  `npx playwright open --browser=chromium --viewport-size=${viewport} ${url}`,
  { stdio: "inherit", cwd: path.join(__dirname, "..") }
);
