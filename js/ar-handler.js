// AR相关功能处理
class ARHandler {
    constructor() {
        this.isDetected = false;
        this.isInitialized = false;
        this.lastRenderTime = 0;
        this.RENDER_THROTTLE = 100;
        this.initElements();
        this.bindEvents();
    }

    initElements() {
        this.scanGuide = document.getElementById('scanGuide');
        this.statusText = document.getElementById('statusText');
        this.arTarget = document.getElementById('arTarget');
        this.cameraBtn = document.getElementById('cameraBtn');
        this.scene = document.querySelector('a-scene');
    }

    bindEvents() {
        // A-Frame场景加载完成
        this.scene.addEventListener('loaded', () => {
            // 性能优化设置
            if (this.scene.renderer) {
                this.scene.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
                this.scene.renderer.antialias = false;
                this.scene.renderer.powerPreference = "high-performance";
            }
            
            if (this.isInitialized) {
                this.statusText.textContent = '请对准识别图';
            }
        });

        // AR目标检测事件
        if (this.arTarget) {
            this.arTarget.addEventListener('targetFound', () => {
                this.onTargetFound();
            });

            this.arTarget.addEventListener('targetLost', () => {
                this.onTargetLost();
            });
        }
    }

    onTargetFound() {
        if (!this.isDetected) {
            this.isDetected = true;
            this.scanGuide.classList.add('hidden');
            this.statusText.textContent = '识别成功';
            this.cameraBtn.classList.add('show');
            
            // 确保3D模型立即渲染
            setTimeout(() => {
                if (this.scene.renderer) {
                    this.scene.renderer.render(this.scene.object3D, this.scene.camera);
                    this.lastRenderTime = Date.now();
                }
            }, 100);
        }
    }

    onTargetLost() {
        this.isDetected = false;
        this.cameraBtn.classList.remove('show');
        if (this.isInitialized) {
            this.scanGuide.classList.remove('hidden');
            this.statusText.textContent = '请对准识别图像';
        }
    }

    initialize() {
        this.isInitialized = true;
        this.scanGuide.classList.add('show');
        
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('您的设备不支持摄像头功能，请使用支持的设备访问。');
            return;
        }
        
        navigator.mediaDevices.getUserMedia({ 
            video: { 
                facingMode: 'environment'
            } 
        })
        .then(() => {
            this.statusText.textContent = '请对准识别图';
        })
        .catch((error) => {
            this.statusText.textContent = '相机权限被拒绝';
            alert('请允许访问摄像头以使用AR功能');
        });
    }
}
