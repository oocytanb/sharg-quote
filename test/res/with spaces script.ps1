#!/usr/bin/env pwsh
# SPDX-License-Identifier: MIT

if ($args.count -eq 0) {
  echo '__EMPTY__'
} else {
  echo $('[' + $($args -join ', ') + ']')
}
