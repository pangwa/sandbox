#ifdef GL_ES
precision highp float;
#endif

#define LIGHT_MAX 50

varying vec2 vTexCoord1;
varying vec2 vTexCoord2;
varying vec2 vTexCoord3;
varying vec4 vColor;
varying vec4 vTransformedNormal;
varying vec4 vPosition;

uniform float shininess;

uniform bool hasTexture1;
uniform sampler2D sampler1;

uniform bool hasTexture2;
uniform sampler2D sampler2;

uniform bool hasTexture3;
uniform sampler2D sampler3;

uniform mat4 viewMatrix;

void main(void) {
  vec3 lightWeighting;
  lightWeighting = vec3(1.0, 1.0, 1.0);
  vec4 fragmentColor = vec4(0.0, 0.0, 0.0, 0.0);
  if (hasTexture1 || hasTexture2 || hasTexture3) {
    if (hasTexture1) {
      fragmentColor += texture2D(sampler1, vec2(vTexCoord1.s, vTexCoord1.t));
    }
    if (hasTexture2) {
      fragmentColor += texture2D(sampler2, vec2(vTexCoord2.s, vTexCoord2.t));
    }
    if (hasTexture3) {
      fragmentColor += texture2D(sampler3, vec2(vTexCoord3.s, vTexCoord3.t));
    }
  } else {
    fragmentColor = vColor;
  }
  gl_FragColor = vec4(fragmentColor.rgb * lightWeighting, fragmentColor.a);
}
