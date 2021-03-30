{
  "targets": [
    {
      "target_name": "addon",
      "cflags!": [ "-fno-exceptions" ],
      "cflags_cc!": [ "-fno-exceptions" ],
      "sources": [ "<!@(ls -1 src/driver/*.cc)", "<!@(ls -1 src/driver/*.c)" ],
      "include_dirs": [
        "<!@(node -p \"require('node-addon-api').include\")"
      ],
      'defines': [ 'NAPI_DISABLE_CPP_EXCEPTIONS' ],
            'LDFLAGS': [
          '-framework IOKit',
          '-framework CoreFoundation'
      ],
      'xcode_settings': {
          'VALID_ARCHS': 'arm64 x86_64',
          'ONLY_ACTIVE_ARCH': 'NO',
          'OTHER_CODE_SIGN_FLAGS': 'timestamp --options=runtime',
          'CLANG_CXX_LIBRARY': 'libc++',
          'MACOSX_DEPLOYMENT_TARGET': '10.15',
          'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
          'OTHER_CFLAGS': [
              '-arch x86_64',
              '-arch arm64'
          ],
          'OTHER_LDFLAGS': [
              '-arch x86_64',
              '-arch arm64',
              '-framework IOKit',
              '-framework CoreFoundation'
          ]
      }
    }
  ]
}
