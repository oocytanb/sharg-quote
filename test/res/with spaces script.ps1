#!/usr/bin/env pwsh

if ($args.count -eq 0) {
  echo '__EMPTY__'
} else {
  echo $('[' + $($args -join ', ') + ']')
}
