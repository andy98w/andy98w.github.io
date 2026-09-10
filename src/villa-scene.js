// A lightweight image-based scene: the photograph stays visible if WebGL is unavailable.
export class VillaScene {
  constructor(container, image) {
    this.container = container;
    this.image = image;
    this.frame = 0;
    this.time = 0;
    this.visible = true;
    this.onVisibility = () => {
      this.visible = !document.hidden;
      this.last = performance.now();
    };
    this.canvas = document.createElement("canvas");
    this.canvas.className = "hero-webgl";
    this.canvas.setAttribute("aria-hidden", "true");
    const gl = (this.gl = this.canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "low-power",
    }));
    if (!gl) return;
    const vertex = `attribute vec2 a_position; varying vec2 v_uv; void main(){v_uv=a_position*.5+.5;gl_Position=vec4(a_position,0.,1.);}`;
    const fragment = `precision mediump float;
      varying vec2 v_uv; uniform sampler2D u_image; uniform vec2 u_cover; uniform float u_time;
      void main(){
        vec2 uv=(v_uv-.5)*u_cover+.5;
        float topLeaves=smoothstep(.62,.9,uv.y)*(1.-smoothstep(.23,.64,abs(uv.x-.38)));
        float vine=exp(-pow((uv.x-.77)*10.,2.)-pow((uv.y-.46)*5.,2.));
        float breeze=sin(u_time*.6+uv.y*15.)*.0008+sin(u_time*.93+uv.x*20.)*.0003;
        uv.x+=breeze*max(topLeaves,vine*.4);
        vec3 color=texture2D(u_image,clamp(uv,.001,.999)).rgb;
        float light=sin(u_time*.24+v_uv.x*4.)*.006;
        color+=vec3(1.,.85,.54)*light;
        gl_FragColor=vec4(color,1.);
      }`;
    const compile = (type, source) => {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader);
        throw new Error("Scene shader unavailable");
      }
      return shader;
    };
    try {
      const vs = compile(gl.VERTEX_SHADER, vertex),
        fs = compile(gl.FRAGMENT_SHADER, fragment);
      this.program = gl.createProgram();
      gl.attachShader(this.program, vs);
      gl.attachShader(this.program, fs);
      gl.linkProgram(this.program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(this.program, gl.LINK_STATUS))
        throw new Error("Scene program unavailable");
      gl.useProgram(this.program);
      this.buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
        gl.STATIC_DRAW,
      );
      const position = gl.getAttribLocation(this.program, "a_position");
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      this.texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, this.texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
      this.uTime = gl.getUniformLocation(this.program, "u_time");
      this.uCover = gl.getUniformLocation(this.program, "u_cover");
      container.appendChild(this.canvas);
      this.resize = () => {
        const w = container.clientWidth,
          h = container.clientHeight,
          dpr = Math.min(devicePixelRatio || 1, 1.5);
        this.canvas.width = Math.round(w * dpr);
        this.canvas.height = Math.round(h * dpr);
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        const view = w / h,
          source = image.naturalWidth / image.naturalHeight;
        gl.uniform2f(
          this.uCover,
          Math.min(view / source, 1),
          Math.min(source / view, 1),
        );
      };
      this.resizeObserver = new ResizeObserver(this.resize);
      this.resizeObserver.observe(container);
      this.resize();
      this.observer = new IntersectionObserver((entries) => {
        this.inView = entries[0].isIntersecting;
        this.last = performance.now();
      });
      this.observer.observe(container);
      this.inView = true;
      this.onContextLost = (e) => {
        e.preventDefault();
        this.canvas.style.display = "none";
        container.classList.remove("scene-ready");
        cancelAnimationFrame(this.frame);
      };
      this.canvas.addEventListener("webglcontextlost", this.onContextLost);
      document.addEventListener("visibilitychange", this.onVisibility);
      this.last = performance.now();
      let lastDraw = 0;
      const draw = (now) => {
        this.frame = requestAnimationFrame(draw);
        const elapsed = Math.min((now - this.last) / 1000, 0.1);
        this.last = now;
        if (!this.visible || !this.inView || now - lastDraw < 30) return;
        lastDraw = now;
        this.time += elapsed;
        gl.uniform1f(this.uTime, this.time);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        container.classList.add("scene-ready");
      };
      this.frame = requestAnimationFrame(draw);
    } catch {
      this.destroy();
    }
  }
  destroy() {
    cancelAnimationFrame(this.frame);
    this.resizeObserver?.disconnect();
    this.observer?.disconnect();
    document.removeEventListener("visibilitychange", this.onVisibility);
    if (this.gl) {
      this.gl.deleteTexture(this.texture);
      this.gl.deleteBuffer(this.buffer);
      this.gl.deleteProgram(this.program);
    }
    this.container.classList.remove("scene-ready");
    this.canvas.remove();
  }
}
