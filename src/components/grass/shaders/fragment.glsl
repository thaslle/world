varying vec3 vColor;
varying vec3 vNormal;
varying vec3 vViewPosition;

#include <alphatest_pars_fragment>
#include <alphamap_pars_fragment>
#include <fog_pars_fragment>

#include <common>
#include <packing>
#include <lights_pars_begin>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>

void main()
{
    float uGrassLightIntensity = 1.0;
    float uShadowDarkness = 0.8;

    vec4 diffuseColor = vec4(vColor, 1.0);
    vec3 grassFinalColor = diffuseColor.rgb * uGrassLightIntensity;
    
    // light calculation derived from <lights_fragment_begin>

    vec3 geometryPosition = vViewPosition;
    vec3 geometryNormal = vNormal;
    vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition - cameraPosition );
    //vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition);

    vec3 geometryClearcoatNormal;
    IncidentLight directLight;
    
    float shadow = 0.0;
    float currentShadow = 0.0;
    float NdotL;
    
    
    #if ( NUM_DIR_LIGHTS > 0) 
        DirectionalLight directionalLight;
    #if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
        DirectionalLightShadow directionalLightShadow;
    #endif
        #pragma unroll_loop_start
        for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
        directionalLight = directionalLights[ i ];
        getDirectionalLightInfo( directionalLight, directLight );
        directionalLightShadow = directionalLightShadows[ i ];
        currentShadow = getShadow( directionalShadowMap[ i ], 
          directionalLightShadow.shadowMapSize,
          directionalLightShadow.shadowIntensity, 
          directionalLightShadow.shadowBias, 
          directionalLightShadow.shadowRadius, 
          vDirectionalShadowCoord[ 0 ]);
          
        currentShadow = all( bvec2( directLight.visible, receiveShadow ) ) ? currentShadow : 1.0;
        float weight = clamp( pow( length( vDirectionalShadowCoord[ i ].xy * 2. - 1. ), 4. ), .0, 1. );

        shadow += mix( currentShadow, 1., weight);
        }
        #pragma unroll_loop_end
    #endif

    grassFinalColor = mix(grassFinalColor , grassFinalColor * uShadowDarkness,  1.0 - shadow) ;
        
    diffuseColor.rgb = clamp(diffuseColor.rgb*shadow,0.0,1.0);

    //#include <alphatest_fragment>
    gl_FragColor = vec4(grassFinalColor ,1.0 - grassFinalColor.r);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>

    #include <fog_fragment>
}