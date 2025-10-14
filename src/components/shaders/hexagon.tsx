"use client";
import React, { forwardRef } from "react";
import { Shader } from "react-shaders";
import { cn } from "@/lib/utils";

export interface HexagonGridPatternShadersProps extends React.HTMLAttributes<HTMLDivElement> {
    speed?: number;
    scale?: number;
    showGrid?: boolean;
    patternDensity?: number;
}

const fragmentShader = `
#extension GL_OES_standard_derivatives : enable

// IQ's vec2 to float hash.
float hash21(vec2 p) {
    return fract(sin(dot(p, vec2(27.617, 57.743))) * 43758.5453);
}

// Flat top hexagon configuration
const vec2 s = vec2(1.732, 1);

// Hexagonal bound: Not technically a distance function, but it's
// good enough for this example.
float getHex(vec2 p) {
    // Flat top hexagon
    return max(dot(abs(p.xy), s/2.), abs(p.y*s.y));
}

// Hexagonal grid coordinates. This returns the local coordinates and the cell's center.
vec4 getGrid(vec2 p) {
    vec4 ip = floor(vec4(p/s, p/s - .5));
    vec4 q = p.xyxy - vec4(ip.xy + .5, ip.zw + 1.)*s.xyxy;
    return dot(q.xy, q.xy)<dot(q.zw, q.zw)? vec4(q.xy, ip.xy) : vec4(q.zw, ip.zw + .5);
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
    // Aspect correct screen coordinates.
    float res = min(iResolution.y, 800.);
    vec2 uv = (fragCoord.xy - iResolution.xy*.5)/res;
    
    // Scaling and translation.
    float sc = u_scale;
    vec2 p = uv*sc - vec2(-1, -.5)*iTime*u_speed/4.;
    
    // Smoothing factor.
    float sf = 1./res*sc;
    
    // Hexagonal grid coordinates.
    vec4 p4 = getGrid(p);
    
    // Hexagon vertex IDs for flat top hexagons.
    // Vertices: Clockwise from the left.
    vec2 vID[6];
    vID[0] = vec2(-1./3., 0);
    vID[1] = vec2(-1./6., .5);
    vID[2] = vec2(1./6., .5);
    vID[3] = vec2(1./3., 0);
    vID[4] = vec2(1./6., -.5);
    vID[5] = vec2(-1./6., -.5);
    
    // Gold color palette - MUCH DARKER for subtle background
    vec3 goldColor = vec3(0.831, 0.686, 0.216) * 0.15; // Very dim gold
    vec3 darkGold = vec3(0.722, 0.537, 0.043) * 0.1;   // Even darker
    vec3 lightGold = vec3(0.722, 0.537, 0.043) * 0.12;
    vec3 black = vec3(0.0, 0.0, 0.0);
    
    // The scene color - start with black background
    vec3 col = black;
    
    // Rendering the six overlapping hexagons within each cell.
    for(int i = 0; i < 6; i++) {
        // Get vertex by index using conditional statements
        vec2 currentVertex;
        vec2 neighborVertex;
        
        if(i == 0) {
            currentVertex = vID[5];
            neighborVertex = vID[4];
        } else if(i == 1) {
            currentVertex = vID[4];
            neighborVertex = vID[3];
        } else if(i == 2) {
            currentVertex = vID[3];
            neighborVertex = vID[2];
        } else if(i == 3) {
            currentVertex = vID[2];
            neighborVertex = vID[1];
        } else if(i == 4) {
            currentVertex = vID[1];
            neighborVertex = vID[0];
        } else {
            currentVertex = vID[0];
            neighborVertex = vID[5];
        }
        
        // Corner hexagon.
        vec2 q = abs(p4.xy - currentVertex*s*.5);
        float hx = getHex(q) - .265;
        float oHx = hx;
        
        // Using the neighboring hexagon to chop out one third.
        q = abs(p4.xy - neighborVertex*s/2.);
        float hx2 = getHex(q) - .27;
        hx = max(hx, -hx2);
        
        // Using the triangle wave formula to render some concentric lines on each hexagon.
        float pat = (1. - abs(fract(oHx*16.*u_patternDensity + .2) - .5)*2.) - .55;
        pat = smoothstep(0., .2, pat);
        
        // Rendering the chopped out hexagon with MUCH darker gold patterns
        col = mix(col, goldColor*pat*0.08, 1. - smoothstep(0., sf, hx));
        col = mix(col, darkGold*0.15, 1. - smoothstep(0., sf, max(oHx + .22, -hx2)));
        
        // Applying a very subtle gold shadow behind the hexagon.
        vec3 sh = mix(col, goldColor*0.03, (1. - smoothstep(0., sf, hx)));
        col = mix(col, sh, (1. - smoothstep(0., sf*8., max(max(hx, hx2), - hx2)))*.5);
    }
    
    // Rendering the grid boundaries or center hexagons.
    float gHx = getHex(p4.xy);
    
    if(u_showGrid > 0.5) {
        // Grid lines in gold
        col = mix(col, black, 1. - smoothstep(0., sf, abs(gHx - .5) - .035));
        col = mix(col, goldColor*1.5, 1. - smoothstep(0., sf, abs(gHx - .5) - .0075));
        col = mix(col, black, (1. - smoothstep(0., sf*5., gHx - .02 - .025))*.5);
        
        // Colored center hexagon in gold
        col = mix(col, black, 1. - smoothstep(0., sf, gHx - .02 - .025));
        col = mix(col, lightGold*0.8, 1. - smoothstep(0., sf, gHx - .015));
    } else {
        // Small shadowed center hexagon - very subtle
        col = mix(col, goldColor*0.08, (1. - smoothstep(0., sf*5., gHx - .02))*.5);
        col = mix(col, darkGold*0.12, 1. - smoothstep(0., sf, gHx - .02));
    }
    
    // Rough gamma correction.
    fragColor = vec4(sqrt(max(col, 0.)), 1);
}
`;

export const HexagonGridPatternShaders = forwardRef<HTMLDivElement, HexagonGridPatternShadersProps>((
    {
        className,
        speed = 1.0,
        scale = 3.0,
        showGrid = false,
        patternDensity = 1.0,
        ...props
    },
    ref
) => {
    return (
        <div
            ref={ref}
            className={cn('fixed inset-0 w-screen h-screen -z-10', className)}
            {...props}
        >
            <Shader
                fs={fragmentShader}
                uniforms={{
                    u_speed: { type: '1f', value: speed },
                    u_scale: { type: '1f', value: scale },
                    u_showGrid: { type: '1f', value: showGrid ? 1.0 : 0.0 },
                    u_patternDensity: { type: '1f', value: patternDensity },
                }}
                style={{ width: '100%', height: '100%' } as CSSStyleDeclaration}
            />
        </div>
    );
});

HexagonGridPatternShaders.displayName = "HexagonGridPatternShaders";

export default HexagonGridPatternShaders;
