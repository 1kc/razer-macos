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
          'CLANG_CXX_LIBRARY': 'libc++',
          'MACOSX_DEPLOYMENT_TARGET': '10.9',
          'GCC_ENABLE_CPP_EXCEPTIONS': 'YES',
          'OTHER_LDFLAGS': [
              '-framework IOKit',
              '-framework CoreFoundation'
          ],
      }
    }
  ]
}