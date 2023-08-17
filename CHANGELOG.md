# Changelog

## 1.0.0 (2023-08-17)


### Features

* account for FAST propety binding attributes FUI-1193 (#19) ([06eb44b](https://github.com/genesiscommunitysuccess/custom-elements-lsp/commit/06eb44ba82e043774fbe2228c882eb84d7659ed7))
* account for global valid FAST boolean bindings FUI-1194 (#18) ([65470d7](https://github.com/genesiscommunitysuccess/custom-elements-lsp/commit/65470d72e637f30f32bbbfb38879e3b573b25c6f))
* add quickinfo for custom element when invoking quickinfo on tagname FUI-1226 (#22) ([857e7af](https://github.com/genesiscommunitysuccess/custom-elements-lsp/commit/857e7af498a955b730a65123baa11cb5c3f34ac5))
* add quickinfo for html element tags and attributes FUI-1227 (#33) ([1dd1706](https://github.com/genesiscommunitysuccess/custom-elements-lsp/commit/1dd17069f3e4e0a38ca42cd136d2a5af397c6ad2))
* add tagname completion for plain html elements FUI-1227 (#29) ([3619d96](https://github.com/genesiscommunitysuccess/custom-elements-lsp/commit/3619d962403a62a4aeade8cb15e3add5135fcbdc))
* attribute autocompletion from superclass FUI-1191 (#9) ([20141d7](https://github.com/genesiscommunitysuccess/custom-elements-lsp/commit/20141d7df265dd2fb7b045ad4cebddc62186fd15))
* Attribute diagnostics for duplicates and deprecated FUI-1194 (#16) ([f2b1676](https://github.com/genesiscommunitysuccess/custom-elements-lsp/commit/f2b16760a17f8dc376dec10514a6514d6379e06c))
* autocomplete attributes on plain html elements FUI-1227 (#32) ([8f652bb](https://github.com/genesiscommunitysuccess/custom-elements-lsp/commit/8f652bbf1a003644654985d1b728aeec8561bc46))
* better event binding handling in FAST FUI-1306 (#20) ([de3853f](https://github.com/genesiscommunitysuccess/custom-elements-lsp/commit/de3853f3fab67c9292b9046604115fc514f57129))
* continuously analyse source code to update custom elements manifest (#26) ([0396631](https://github.com/genesiscommunitysuccess/custom-elements-lsp/commit/0396631c787c800bbe4df1e9cdf4280cb0a9b874)), closes FUI-1195
* diagnostics support for non-custom elements FUI-1227 (#34) ([e9da5be](https://github.com/genesiscommunitysuccess/custom-elements-lsp/commit/e9da5be70d49b547282d76210edd0962a60ec60a))
* event binding autocompletion for FAST FUI-1191 (#10) ([992ec2c](https://github.com/genesiscommunitysuccess/custom-elements-lsp/commit/992ec2cce692077e3424adc6e1b2d9ba91576ba1))
* fast binding boolean attr and show deprecated attr during autocomplete FUI-1191 (#11) ([6741f94](https://github.com/genesiscommunitysuccess/custom-elements-lsp/commit/6741f947bbe5468c1ae90bd7b0bc40f5fb370378))
* global attribute autocompletion FUI-1191 (#8) ([8e93261](https://github.com/genesiscommunitysuccess/custom-elements-lsp/commit/8e93261867d99f4c60debef789fb68e39d989ef3))
* handle design system prefix composed element definitions FUI-1197 (#4) ([535e957](https://github.com/genesiscommunitysuccess/custom-elements-lsp/commit/535e957ed688230c770d29fe6b5d311ed035b946))
* jump to definiton of tag names FUI-1190 (#21) ([9e97abe](https://github.com/genesiscommunitysuccess/custom-elements-lsp/commit/9e97abe34a943af7c4234eb59542bd769263fcfd))
* Property autocompletion in FAST templates (#13) ([a1812fb](https://github.com/genesiscommunitysuccess/custom-elements-lsp/commit/a1812fb32d7b2d22e8c39a8756b3ff5299f25f82)), closes FUI-1192 FUI-1192 FUI-1192](https://github.com/genesiscommunitysuccess/custom-elements-lsp/issues/1192)
* quickinfo for plain and FAST syntax attributes FUI-1226 (#24) ([d89f08f](https://github.com/genesiscommunitysuccess/custom-elements-lsp/commit/d89f08f825421d83e7cbcf2d4a628932951b9d30))
* Setup unit tests for completions FUI-1189 (#1) ([0b24169](https://github.com/genesiscommunitysuccess/custom-elements-lsp/commit/0b241693c234225b3d3c2e29fd6d1498ccd557ec))


### Bug Fixes

* attribute completions for a multi-line opening tag FUI-1302 (#14) ([30d8210](https://github.com/genesiscommunitysuccess/custom-elements-lsp/commit/30d821008d25e325d4ef25a888c9e2ffbac19c02))
* attribute diagnostics where attributes are substrings of others FUI-1416 (#36) ([797b84f](https://github.com/genesiscommunitysuccess/custom-elements-lsp/commit/797b84f49b5b9ce9f5fea33ebf108b30ccb4b3a3))
* behaviour for attribute values containing whitespace FUI-1324 (#27) ([09f21f9](https://github.com/genesiscommunitysuccess/custom-elements-lsp/commit/09f21f9900668dde6a9e19ff1af3ed14687d0333))
* regression with custom element losing superclass into from library FUI-1388 (#28) ([71d8ff5](https://github.com/genesiscommunitysuccess/custom-elements-lsp/commit/71d8ff5c16a86bc18b42ea4647e7543fd709e474))
* text parsing bug involving empty quotes FUI-1409 (#31) ([82faffa](https://github.com/genesiscommunitysuccess/custom-elements-lsp/commit/82faffa9060d19fa930e9c2b246a90cff34ec26b))
