// 应用主入口
class ARApp {
    constructor() {
        this.initHandlers();
        this.bindGlobalEvents();
        this.setupViewport();
    }

    initHandlers() {
        // 初始化各个处理器
        window.arHandler = new ARHandler();
        window.cameraHandler = new CameraHandler();
        
        // 暴露scene到全局供其他模块使用
        window.scene = document.querySelector('a-scene');
    }

    bindGlobalEvents() {
        // 帮助按钮
        document.getElementById('helpBtn').addEventListener('click', () => {
            document.getElementById('helpModal').classList.add('show');
        });

        // 帮助模态框关闭
        const helpModal = document.getElementById('helpModal');
        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal) {
                this.closeHelp();
            }
        });

        // 页面加载完成
        window.addEventListener('load', () => {
            setTimeout(() => {
                window.arHandler.initialize();
            }, 1000);
        });

        // 防止双击缩放
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function (event) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                event.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // 防止手势缩放
        document.addEventListener('gesturestart', function(e) {
            e.preventDefault();
        });

        // 视口调整
        window.addEventListener('resize', () => {
            this.updateViewport();
        });
    }

    setupViewport() {
        this.updateViewport();
    }

    updateViewport() {
        document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
    }

    closeHelp() {
        document.getElementById('helpModal').classList.remove('show');
    }
}

// 全局函数（保持兼容性）
function closeHelp() {
    window.app.closeHelp();
}

// 应用启动
document.addEventListener('DOMContentLoaded', () => {
    window.app = new ARApp();
});
