// ===== 3D场景管理 =====

const Scene3D = {
    scene: null,
    camera: null,
    renderer: null,
    
    // 场景对象
    plotMeshes: [],
    cropMeshes: [],
    animalMeshes: [],
    
    // 相机控制
    cameraAngle: 0,
    cameraDistance: 18,
    cameraHeight: 12,
    isDragging: false,
    lastMouseX: 0,
    lastMouseY: 0,
    
    // 光照
    sunLight: null,
    ambientLight: null,
    
    // 粒子系统
    particles: [],
    
    // 初始化
    init() {
        const canvas = document.getElementById('gameCanvas');
        
        // 创建场景
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB);
        this.scene.fog = new THREE.Fog(0x87CEEB, 30, 80);
        
        // 创建相机
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
        this.updateCamera();
        
        // 创建渲染器
        this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        // 扩大远裁面，确保远景层可见
        this.camera.far = 300;
        this.camera.updateProjectionMatrix();

        
        // 光照
        this.setupLighting();
        
        // 创建地形
        this.createTerrain();
        
        // 创建农场土地
        this.createPlots();
        
        // 创建装饰物
        this.createDecorations();
        
        // 创建天空
        this.createSky();
        
        // 天地融合：远景层、地平线云雾、飞鸟
        if (typeof SceneHorizon !== 'undefined') {
            SceneHorizon.init(this.scene);
        }
        
        // 事件监听

        this.setupEvents();
        
        // 窗口大小变化
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    },
    
    // 设置光照
    setupLighting() {
        // 环境光
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(this.ambientLight);
        
        // 太阳光
        this.sunLight = new THREE.DirectionalLight(0xfff5e0, 1.2);
        this.sunLight.position.set(20, 30, 20);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 100;
        this.sunLight.shadow.camera.left = -30;
        this.sunLight.shadow.camera.right = 30;
        this.sunLight.shadow.camera.top = 30;
        this.sunLight.shadow.camera.bottom = -30;
        this.scene.add(this.sunLight);
        
        // 半球光（天空/地面）
        const hemiLight = new THREE.HemisphereLight(0x87CEEB, 0x4a7c59, 0.4);
        this.scene.add(hemiLight);
    },
    
    // 创建地形
    createTerrain() {
        // 使用美化模块创建多层次草地
        if (typeof SceneBeautify !== 'undefined') {
            SceneBeautify.createRichTerrain(this.scene);
            SceneBeautify.createPaths(this.scene);
            SceneBeautify.createBeautifulFence(this.scene);
        } else {
            // 降级：原始地面
            const groundGeo = new THREE.PlaneGeometry(60, 60, 20, 20);
            const groundMat = new THREE.MeshLambertMaterial({ color: 0x5a8a3c });
            const ground = new THREE.Mesh(groundGeo, groundMat);
            ground.rotation.x = -Math.PI / 2;
            ground.receiveShadow = true;
            this.scene.add(ground);
            this.createFence();
        }
    },

    
    // 创建围栏
    createFence() {
        const fenceColor = 0x8B6914;
        const postGeo = new THREE.BoxGeometry(0.2, 1.2, 0.2);
        const postMat = new THREE.MeshLambertMaterial({ color: fenceColor });
        const railGeo = new THREE.BoxGeometry(2.5, 0.15, 0.1);
        const railMat = new THREE.MeshLambertMaterial({ color: fenceColor });
        
        const positions = [];
        for (let i = -12; i <= 12; i += 2.5) {
            positions.push([i, -12], [i, 12], [-12, i], [12, i]);
        }
        
        positions.forEach(([x, z]) => {
            const post = new THREE.Mesh(postGeo, postMat);
            post.position.set(x, 0.6, z);
            post.castShadow = true;
            this.scene.add(post);
        });
        
        // 横向栏杆
        for (let i = -12; i <= 12; i += 2.5) {
            const rail1 = new THREE.Mesh(railGeo, railMat);
            rail1.position.set(i + 1.25, 0.8, -12);
            this.scene.add(rail1);
            const rail2 = new THREE.Mesh(railGeo, railMat);
            rail2.position.set(i + 1.25, 0.4, -12);
            this.scene.add(rail2);
            
            const rail3 = new THREE.Mesh(railGeo, railMat);
            rail3.position.set(i + 1.25, 0.8, 12);
            this.scene.add(rail3);
            const rail4 = new THREE.Mesh(railGeo, railMat);
            rail4.position.set(i + 1.25, 0.4, 12);
            this.scene.add(rail4);
        }
        
        // 纵向栏杆
        const railV = new THREE.BoxGeometry(0.1, 0.15, 2.5);
        for (let i = -12; i <= 12; i += 2.5) {
            const rail1 = new THREE.Mesh(railV, railMat);
            rail1.position.set(-12, 0.8, i + 1.25);
            this.scene.add(rail1);
            const rail2 = new THREE.Mesh(railV, railMat);
            rail2.position.set(-12, 0.4, i + 1.25);
            this.scene.add(rail2);
            
            const rail3 = new THREE.Mesh(railV, railMat);
            rail3.position.set(12, 0.8, i + 1.25);
            this.scene.add(rail3);
            const rail4 = new THREE.Mesh(railV, railMat);
            rail4.position.set(12, 0.4, i + 1.25);
            this.scene.add(rail4);
        }
    },
    
    // 创建农场土地（3x3布局）
    createPlots() {
        const plotPositions = [
            [-5, -5], [0, -5], [5, -5],
            [-5, 0],  [0, 0],  [5, 0],
            [-5, 5],  [0, 5],  [5, 5]
        ];
        
        plotPositions.forEach((pos, i) => {
            const group = new THREE.Group();
            group.position.set(pos[0], 0, pos[1]);
            group.userData = { plotId: i, type: 'plot' };
            
            // 使用美化模块创建土地
            if (typeof SceneBeautify !== 'undefined') {
                SceneBeautify.createBeautifulPlot(group, i);
            } else {
                const soilGeo = new THREE.BoxGeometry(3.5, 0.3, 3.5);
                const soilMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
                const soil = new THREE.Mesh(soilGeo, soilMat);
                soil.position.y = 0.15;
                soil.receiveShadow = true;
                soil.castShadow = true;
                group.add(soil);
                group.userData.soilMesh = soil;
                const borderGeo = new THREE.BoxGeometry(3.8, 0.1, 3.8);
                const borderMat = new THREE.MeshLambertMaterial({ color: 0x5C3317 });
                const border = new THREE.Mesh(borderGeo, borderMat);
                border.position.y = 0.05;
                group.add(border);
            }
            
            this.scene.add(group);
            this.plotMeshes.push(group);
            this.cropMeshes.push(null);
        });

    },
    
    // 创建装饰物
    createDecorations() {
        // 谷仓
        this.createBarn(-9, -9);
        
        // 风车
        this.createWindmill(9, -9);
        
        // 树木
        const treePositions = [[-10, 5], [-10, -2], [10, 5], [10, -2], [-7, 10], [7, 10], [-7, -10], [7, -10]];
        treePositions.forEach(([x, z]) => this.createTree(x, z));
        
        // 使用美化模块添加地面装饰、农场道具、氛围粒子
        if (typeof SceneBeautify !== 'undefined') {
            SceneBeautify.createGroundDecorations(this.scene);
            SceneBeautify.createFarmProps(this.scene);
            SceneBeautify.createAtmosphereParticles(this.scene);
        } else {
            // 降级：原始花朵
            for (let i = 0; i < 20; i++) {
                const x = (Math.random() - 0.5) * 20 + (Math.random() > 0.5 ? 10 : -10);
                const z = (Math.random() - 0.5) * 20;
                this.createFlower(x, z);
            }
        }
    },

    
    // 创建谷仓
    createBarn(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        
        // 主体
        const bodyGeo = new THREE.BoxGeometry(3, 2.5, 3);
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0xcc3333 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1.25;
        body.castShadow = true;
        group.add(body);
        
        // 屋顶
        const roofGeo = new THREE.ConeGeometry(2.5, 1.5, 4);
        const roofMat = new THREE.MeshLambertMaterial({ color: 0x8B0000 });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 3.25;
        roof.rotation.y = Math.PI / 4;
        roof.castShadow = true;
        group.add(roof);
        
        // 门
        const doorGeo = new THREE.BoxGeometry(0.8, 1.5, 0.1);
        const doorMat = new THREE.MeshLambertMaterial({ color: 0x5C3317 });
        const door = new THREE.Mesh(doorGeo, doorMat);
        door.position.set(0, 0.75, 1.55);
        group.add(door);
        
        this.scene.add(group);
    },
    
    // 创建风车
    createWindmill(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        group.userData = { type: 'windmill' };
        
        // 塔身
        const towerGeo = new THREE.CylinderGeometry(0.3, 0.5, 4, 8);
        const towerMat = new THREE.MeshLambertMaterial({ color: 0xdddddd });
        const tower = new THREE.Mesh(towerGeo, towerMat);
        tower.position.y = 2;
        tower.castShadow = true;
        group.add(tower);
        
        // 风叶
        const bladeGroup = new THREE.Group();
        bladeGroup.position.y = 4;
        bladeGroup.userData = { isWindmill: true };
        
        for (let i = 0; i < 4; i++) {
            const bladeGeo = new THREE.BoxGeometry(0.2, 2, 0.05);
            const bladeMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
            const blade = new THREE.Mesh(bladeGeo, bladeMat);
            blade.position.y = 1;
            blade.rotation.z = (i * Math.PI) / 2;
            bladeGroup.add(blade);
        }
        
        group.add(bladeGroup);
        this.scene.add(group);
        this.windmillBlades = bladeGroup;
    },
    
    // 创建树
    createTree(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        
        // 树干
        const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 8);
        const trunkMat = new THREE.MeshLambertMaterial({ color: 0x5C3317 });
        const trunk = new THREE.Mesh(trunkGeo, trunkMat);
        trunk.position.y = 0.75;
        trunk.castShadow = true;
        group.add(trunk);
        
        // 树冠（多层）
        const colors = [0x2d8a2d, 0x3aaa3a, 0x4ccc4c];
        [2.5, 2, 1.5].forEach((size, i) => {
            const leafGeo = new THREE.ConeGeometry(size * 0.6, size * 0.8, 8);
            const leafMat = new THREE.MeshLambertMaterial({ color: colors[i] });
            const leaf = new THREE.Mesh(leafGeo, leafMat);
            leaf.position.y = 1.5 + i * 0.8;
            leaf.castShadow = true;
            group.add(leaf);
        });
        
        this.scene.add(group);
    },
    
    // 创建水井
    createWell(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        
        // 井身
        const wellGeo = new THREE.CylinderGeometry(0.6, 0.6, 0.8, 12);
        const wellMat = new THREE.MeshLambertMaterial({ color: 0x888888 });
        const well = new THREE.Mesh(wellGeo, wellMat);
        well.position.y = 0.4;
        well.castShadow = true;
        group.add(well);
        
        // 井架
        const postGeo = new THREE.BoxGeometry(0.1, 1.5, 0.1);
        const postMat = new THREE.MeshLambertMaterial({ color: 0x5C3317 });
        [-0.5, 0.5].forEach(x => {
            const post = new THREE.Mesh(postGeo, postMat);
            post.position.set(x, 1.15, 0);
            group.add(post);
        });
        
        const topGeo = new THREE.BoxGeometry(1.2, 0.1, 0.1);
        const top = new THREE.Mesh(topGeo, postMat);
        top.position.y = 1.9;
        group.add(top);
        
        this.scene.add(group);
    },
    
    // 创建花朵
    createFlower(x, z) {
        const group = new THREE.Group();
        group.position.set(x, 0, z);
        
        const stemGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.4, 6);
        const stemMat = new THREE.MeshLambertMaterial({ color: 0x44aa44 });
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.y = 0.2;
        group.add(stem);
        
        const colors = [0xff6688, 0xffaa00, 0xff4444, 0xaa44ff, 0xffff44];
        const flowerGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const flowerMat = new THREE.MeshLambertMaterial({ color: colors[Math.floor(Math.random() * colors.length)] });
        const flower = new THREE.Mesh(flowerGeo, flowerMat);
        flower.position.y = 0.45;
        group.add(flower);
        
        this.scene.add(group);
    },
    
    // 创建天空
    createSky() {
        // 云朵
        for (let i = 0; i < 8; i++) {
            this.createCloud(
                (Math.random() - 0.5) * 60,
                15 + Math.random() * 10,
                (Math.random() - 0.5) * 60
            );
        }
    },
    
    // 创建云朵
    createCloud(x, y, z) {
        const group = new THREE.Group();
        group.position.set(x, y, z);
        group.userData = { type: 'cloud', speed: 0.5 + Math.random() * 0.5 };
        
        const cloudMat = new THREE.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 });
        const sizes = [1.5, 1, 1.2, 0.8];
        const offsets = [[0, 0, 0], [1.2, -0.3, 0], [-1.2, -0.3, 0], [0.6, 0.3, 0]];
        
        sizes.forEach((size, i) => {
            const geo = new THREE.SphereGeometry(size, 8, 8);
            const mesh = new THREE.Mesh(geo, cloudMat);
            mesh.position.set(...offsets[i]);
            group.add(mesh);
        });
        
        this.scene.add(group);
        this.clouds = this.clouds || [];
        this.clouds.push(group);
    },
    
    // 更新相机
    updateCamera() {
        const x = Math.sin(this.cameraAngle) * this.cameraDistance;
        const z = Math.cos(this.cameraAngle) * this.cameraDistance;
        this.camera.position.set(x, this.cameraHeight, z);
        this.camera.lookAt(0, 0, 0);
    },
    
    // 更新土地显示
    updatePlot(plot) {
        const group = this.plotMeshes[plot.id];
        if (!group) return;
        
        // 移除旧的作物模型
        if (this.cropMeshes[plot.id]) {
            group.remove(this.cropMeshes[plot.id]);
            this.cropMeshes[plot.id] = null;
        }
        
        // 更新土地颜色
        const soil = group.children[0];
        if (plot.quality === 'fertile') {
            soil.material.color.setHex(0x6B3A2A);
        } else if (plot.quality === 'magic') {
            soil.material.color.setHex(0x4a2a6B);
        } else {
            soil.material.color.setHex(0x8B4513);
        }
        
        if (plot.state === 'empty') return;
        
        const crop = CROPS_DATA[plot.crop];
        if (!crop) return;
        
        // 创建作物模型
        const cropGroup = new THREE.Group();
        const progress = plot.growProgress;
        
        if (plot.state === 'ready') {
            // 成熟状态 - 完整作物
            this.createMatureCrop(cropGroup, crop, plot);
        } else {
            // 生长中
            const scale = 0.3 + progress * 0.7;
            this.createGrowingCrop(cropGroup, crop, scale, plot);
        }
        
        cropGroup.position.y = 0.3;
        group.add(cropGroup);
        this.cropMeshes[plot.id] = cropGroup;
    },
    
    // 创建生长中的作物
    createGrowingCrop(group, crop, scale, plot) {
        // 使用新植物外观系统
        const stage = getCropStage(plot.growProgress, plot.state);
        if (typeof PlantBuilder !== 'undefined') {
            PlantBuilder.build(group, crop.id, stage);
            // 设置随机摇摆相位
            group.userData.swayPhase = Math.random() * Math.PI * 2;
            group.userData.cropId = crop.id;
        } else {
            // 降级：通用幼苗
            const stemGeo = new THREE.CylinderGeometry(0.05 * scale, 0.08 * scale, 0.8 * scale, 6);
            const stemMat = new THREE.MeshLambertMaterial({ color: 0x44aa44 });
            const stem = new THREE.Mesh(stemGeo, stemMat);
            stem.position.y = 0.4 * scale;
            stem.castShadow = true;
            group.add(stem);
            const leafGeo = new THREE.SphereGeometry(0.3 * scale, 8, 8);
            const leafMat = new THREE.MeshLambertMaterial({ color: crop.color });
            const leaf = new THREE.Mesh(leafGeo, leafMat);
            leaf.position.y = 0.8 * scale;
            leaf.scale.y = 0.6;
            leaf.castShadow = true;
            group.add(leaf);
        }
        
        // 浇水效果
        if (plot.watered) {
            const waterGeo = new THREE.SphereGeometry(0.05, 6, 6);
            const waterMat = new THREE.MeshLambertMaterial({ color: 0x4488ff, transparent: true, opacity: 0.7 });
            for (let i = 0; i < 3; i++) {
                const drop = new THREE.Mesh(waterGeo, waterMat);
                drop.position.set((Math.random() - 0.5) * 0.5, 0.1 + Math.random() * 0.3, (Math.random() - 0.5) * 0.5);
                group.add(drop);
            }
        }
    },

    
    // 创建成熟作物
    createMatureCrop(group, crop, plot) {
        // 使用新植物外观系统（阶段4=成熟）
        if (typeof PlantBuilder !== 'undefined') {
            PlantBuilder.build(group, crop.id, 4);
            group.userData.swayPhase = Math.random() * Math.PI * 2;
            group.userData.cropId = crop.id;
        } else {
            // 降级：通用成熟模型
            const stemGeo = new THREE.CylinderGeometry(0.06, 0.1, 1.2, 6);
            const stemMat = new THREE.MeshLambertMaterial({ color: 0x44aa44 });
            const stem = new THREE.Mesh(stemGeo, stemMat);
            stem.position.y = 0.6;
            stem.castShadow = true;
            group.add(stem);
            const fruitGeo = new THREE.SphereGeometry(0.4, 10, 10);
            const fruitMat = new THREE.MeshLambertMaterial({ color: crop.color });
            const fruit = new THREE.Mesh(fruitGeo, fruitMat);
            fruit.position.y = 1.3;
            fruit.castShadow = true;
            group.add(fruit);
        }
        
        // 完美品质光效
        if (plot.cropQuality === 'perfect') {
            const glowGeo = new THREE.SphereGeometry(0.6, 8, 8);
            const glowMat = new THREE.MeshLambertMaterial({ color: 0xffd700, transparent: true, opacity: 0.3 });
            const glow = new THREE.Mesh(glowGeo, glowMat);
            glow.position.y = 1.3;
            group.add(glow);
        }
        
        // 成熟跳动动画标记
        group.userData.bouncing = true;
        group.userData.bounceTime = Math.random() * Math.PI * 2;
    },

    
    // ===== 动物外观构建系统 =====

    // 创建鸡模型
    _buildChicken(group, color) {
        const bodyMat = new THREE.MeshLambertMaterial({ color: color || 0xf5f0e0 });
        const legMat = new THREE.MeshLambertMaterial({ color: 0xf5a623 });
        const combMat = new THREE.MeshLambertMaterial({ color: 0xcc2200 });
        const beakMat = new THREE.MeshLambertMaterial({ color: 0xf5a623 });
        const eyeMat = new THREE.MeshLambertMaterial({ color: 0x111111 });

        // 身体 - 圆润椭球形，前胸挺起
        const bodyGeo = new THREE.SphereGeometry(0.22, 10, 8);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.scale.set(1.0, 0.9, 1.2);
        body.position.set(0, 0.28, 0);
        body.castShadow = true;
        group.add(body);

        // 头部 - 小型椭圆
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.52, 0.22);
        const headGeo = new THREE.SphereGeometry(0.13, 8, 8);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.castShadow = true;
        headGroup.add(head);

        // 鸡冠 - 红色锯齿状（5个齿）
        for (let i = 0; i < 5; i++) {
            const combGeo = new THREE.ConeGeometry(0.025, 0.06 + (i === 2 ? 0.03 : 0), 4);
            const comb = new THREE.Mesh(combGeo, combMat);
            comb.position.set((i - 2) * 0.04, 0.13 + (i === 2 ? 0.015 : 0), 0);
            headGroup.add(comb);
        }

        // 肉垂 - 下方红色
        const wattleGeo = new THREE.SphereGeometry(0.04, 6, 6);
        const wattle = new THREE.Mesh(wattleGeo, combMat);
        wattle.scale.set(1, 1.3, 0.8);
        wattle.position.set(0, -0.1, 0.06);
        headGroup.add(wattle);

        // 喙 - 尖锐三角形，黄色
        const beakGeo = new THREE.ConeGeometry(0.03, 0.1, 4);
        const beak = new THREE.Mesh(beakGeo, beakMat);
        beak.rotation.x = Math.PI / 2;
        beak.position.set(0, -0.02, 0.14);
        headGroup.add(beak);

        // 眼睛
        const eyeGeo = new THREE.SphereGeometry(0.025, 6, 6);
        [-0.07, 0.07].forEach(ex => {
            const eye = new THREE.Mesh(eyeGeo, eyeMat);
            eye.position.set(ex, 0.03, 0.1);
            headGroup.add(eye);
        });

        group.add(headGroup);

        // 翅膀 - 短小贴合身体两侧
        [-1, 1].forEach(side => {
            const wingGeo = new THREE.SphereGeometry(0.1, 6, 6);
            const wing = new THREE.Mesh(wingGeo, bodyMat);
            wing.scale.set(0.5, 0.7, 1.1);
            wing.position.set(side * 0.22, 0.3, 0);
            wing.castShadow = true;
            group.add(wing);
        });

        // 尾羽 - 短翘羽毛束
        const tailGeo = new THREE.ConeGeometry(0.08, 0.2, 5);
        const tail = new THREE.Mesh(tailGeo, bodyMat);
        tail.rotation.x = -Math.PI / 3;
        tail.position.set(0, 0.38, -0.22);
        group.add(tail);

        // 腿 - 细长黄色，关节后弯
        const legGeo = new THREE.CylinderGeometry(0.025, 0.02, 0.22, 5);
        const leftLegGroup = new THREE.Group();
        leftLegGroup.position.set(-0.08, 0.1, 0.02);
        const leftLeg = new THREE.Mesh(legGeo, legMat);
        leftLeg.position.y = -0.11;
        leftLegGroup.add(leftLeg);
        // 爪子
        const clawGeo = new THREE.CylinderGeometry(0.015, 0.01, 0.08, 4);
        [-1, 0, 1].forEach(dir => {
            const claw = new THREE.Mesh(clawGeo, legMat);
            claw.rotation.x = Math.PI / 2;
            claw.rotation.z = dir * 0.4;
            claw.position.set(dir * 0.04, -0.22, 0.03);
            leftLegGroup.add(claw);
        });
        group.add(leftLegGroup);

        const rightLegGroup = new THREE.Group();
        rightLegGroup.position.set(0.08, 0.1, 0.02);
        const rightLeg = new THREE.Mesh(legGeo, legMat);
        rightLeg.position.y = -0.11;
        rightLegGroup.add(rightLeg);
        [-1, 0, 1].forEach(dir => {
            const claw = new THREE.Mesh(clawGeo, legMat);
            claw.rotation.x = Math.PI / 2;
            claw.rotation.z = dir * 0.4;
            claw.position.set(dir * 0.04, -0.22, 0.03);
            rightLegGroup.add(claw);
        });
        group.add(rightLegGroup);

        // 存储动画部件引用
        group.userData.parts = {
            body, headGroup,
            leftLeg: leftLegGroup, rightLeg: rightLegGroup,
            tail
        };
        group.userData.baseHeadPos = headGroup.position.clone();
        group.userData.baseBodyY = body.position.y;
    },

    // 创建羊模型
    _buildSheep(group, color) {
        const woolMat = new THREE.MeshLambertMaterial({ color: color || 0xf0ede8 });
        const skinMat = new THREE.MeshLambertMaterial({ color: 0xd4c5a9 });
        const legMat = new THREE.MeshLambertMaterial({ color: 0x888880 });
        const eyeMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
        const pupilMat = new THREE.MeshLambertMaterial({ color: 0x222200 });

        // 身体 - 厚实圆筒形，覆盖蓬松羊毛
        const bodyGeo = new THREE.SphereGeometry(0.38, 10, 8);
        const body = new THREE.Mesh(bodyGeo, woolMat);
        body.scale.set(1.0, 0.85, 1.3);
        body.position.set(0, 0.42, 0);
        body.castShadow = true;
        group.add(body);

        // 羊毛蓬松效果 - 多个球形叠加
        const woolGroup = new THREE.Group();
        woolGroup.position.set(0, 0.42, 0);
        const woolPositions = [
            [0.2, 0.15, 0.2], [-0.2, 0.15, 0.2], [0, 0.2, 0.3],
            [0.25, 0.1, -0.1], [-0.25, 0.1, -0.1], [0, 0.18, -0.25],
            [0.15, 0.2, 0], [-0.15, 0.2, 0]
        ];
        woolPositions.forEach(([wx, wy, wz]) => {
            const wGeo = new THREE.SphereGeometry(0.14 + Math.random() * 0.05, 6, 6);
            const w = new THREE.Mesh(wGeo, woolMat);
            w.position.set(wx, wy, wz);
            woolGroup.add(w);
        });
        group.add(woolGroup);

        // 头部 - 窄长脸型
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.62, 0.42);
        const headGeo = new THREE.BoxGeometry(0.22, 0.26, 0.32);
        const head = new THREE.Mesh(headGeo, skinMat);
        head.castShadow = true;
        headGroup.add(head);

        // 鼻吻部
        const snoutGeo = new THREE.BoxGeometry(0.16, 0.14, 0.12);
        const snout = new THREE.Mesh(snoutGeo, skinMat);
        snout.position.set(0, -0.06, 0.18);
        headGroup.add(snout);

        // 耳朵 - 水平向两侧
        [-1, 1].forEach(side => {
            const earGeo = new THREE.SphereGeometry(0.07, 6, 6);
            const ear = new THREE.Mesh(earGeo, skinMat);
            ear.scale.set(0.5, 0.8, 1.2);
            ear.position.set(side * 0.16, 0.06, -0.05);
            ear.rotation.z = side * 0.3;
            headGroup.add(ear);
        });

        // 眼睛 - 横向瞳孔（关键特征）
        [-0.08, 0.08].forEach(ex => {
            const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);
            const eye = new THREE.Mesh(eyeGeo, eyeMat);
            eye.position.set(ex, 0.04, 0.14);
            headGroup.add(eye);
            // 横向瞳孔
            const pupilGeo = new THREE.BoxGeometry(0.06, 0.015, 0.01);
            const pupil = new THREE.Mesh(pupilGeo, pupilMat);
            pupil.position.set(ex, 0.04, 0.175);
            headGroup.add(pupil);
        });

        group.add(headGroup);

        // 四条腿 - 细长直立
        const legGeo = new THREE.CylinderGeometry(0.055, 0.045, 0.38, 6);
        const legPositions = [
            { name: 'frontLeft', x: -0.16, z: 0.22 },
            { name: 'frontRight', x: 0.16, z: 0.22 },
            { name: 'backLeft', x: -0.16, z: -0.22 },
            { name: 'backRight', x: 0.16, z: -0.22 }
        ];
        const legGroups = {};
        legPositions.forEach(({ name, x, z }) => {
            const lg = new THREE.Group();
            lg.position.set(x, 0.19, z);
            const leg = new THREE.Mesh(legGeo, legMat);
            leg.position.y = 0;
            lg.add(leg);
            // 蹄子（偶蹄）
            const hoofGeo = new THREE.BoxGeometry(0.08, 0.06, 0.1);
            const hoofMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
            const hoof = new THREE.Mesh(hoofGeo, hoofMat);
            hoof.position.y = -0.2;
            lg.add(hoof);
            group.add(lg);
            legGroups[name] = lg;
        });

        // 尾巴 - 短小下垂
        const tailGeo = new THREE.SphereGeometry(0.08, 6, 6);
        const tail = new THREE.Mesh(tailGeo, woolMat);
        tail.position.set(0, 0.42, -0.42);
        group.add(tail);

        group.userData.parts = {
            body, headGroup, woolGroup,
            frontLeft: legGroups.frontLeft, frontRight: legGroups.frontRight,
            backLeft: legGroups.backLeft, backRight: legGroups.backRight,
            tail
        };
        group.userData.baseWoolScale = woolGroup.scale.clone();
        group.userData.baseHeadPos = headGroup.position.clone();
    },

    // 创建牛模型
    _buildCow(group, color) {
        // ===== 高辨识度卡通奶牛 =====
        // 核心特征：黑白斑块、横向长方体型、宽大鼻镜、水平耳朵、短犄角、乳房
        // 总高度约1.1单位，身长约1.5单位（身长>身高，比例约1.4:1）

        // --- 材质定义 ---
        const bodyMat     = new THREE.MeshLambertMaterial({ color: 0xF5F5F0 }); // 奶白色底色
        const spotMat     = new THREE.MeshLambertMaterial({ color: 0x1A1A1A }); // 纯黑斑块
        const legMat      = new THREE.MeshLambertMaterial({ color: 0xF0EEE8 }); // 腿部白色
        const hoofMat     = new THREE.MeshLambertMaterial({ color: 0x3D3D3D }); // 深灰蹄子
        const hornMat     = new THREE.MeshLambertMaterial({ color: 0xD4C4A8 }); // 米黄犄角
        const eyeMat      = new THREE.MeshLambertMaterial({ color: 0x4A3728 }); // 深棕眼睛
        const eyeHighMat  = new THREE.MeshLambertMaterial({ color: 0xFFFFFF }); // 眼睛高光
        const noseMat     = new THREE.MeshLambertMaterial({ color: 0xE8B4B8 }); // 粉色鼻镜
        const nostrilMat  = new THREE.MeshLambertMaterial({ color: 0xB07880 }); // 鼻孔深色
        const earInnerMat = new THREE.MeshLambertMaterial({ color: 0xF0C0C0 }); // 耳内浅粉
        const udderMat    = new THREE.MeshLambertMaterial({ color: 0xF5D0D0 }); // 乳房粉白
        const tailMat     = new THREE.MeshLambertMaterial({ color: 0xE8E4DC }); // 尾巴米白
        const neckMat     = new THREE.MeshLambertMaterial({ color: 0xF0EDE5 }); // 颈部

        // ===== 身体 - 横向桶状，身长明显大于身高 =====
        // 身体：宽0.72，高0.50，长1.05（长宽比约1.4:1）
        const bodyGeo = new THREE.SphereGeometry(0.35, 14, 10);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.scale.set(2.06, 1.43, 3.0);  // x=0.72, y=0.50, z=1.05
        body.position.set(0, 0.58, 0);
        body.castShadow = true;
        group.add(body);

        // ===== 黑白斑块 - 不规则大斑，贴合身体表面 =====
        // 使用扁平椭球贴在身体表面，scale.y极小使其贴合曲面
        // 身体表面：右侧x≈+0.72，左侧x≈-0.72，顶部y≈0.58+0.50=1.08，底部y≈0.08
        const spotDefs = [
            // 背部右侧大斑（最显眼）
            { pos: [0.55, 0.95, 0.10],  scale: [0.28, 0.22, 0.38], rx: 0,    rz:  0.5 },
            // 背部左侧大斑
            { pos: [-0.50, 0.92, -0.15], scale: [0.24, 0.20, 0.42], rx: 0,   rz: -0.5 },
            // 右侧腹大斑
            { pos: [0.68, 0.62, 0.25],  scale: [0.20, 0.30, 0.28], rx: 0,    rz:  1.1 },
            // 左侧腹斑
            { pos: [-0.65, 0.58, -0.30], scale: [0.18, 0.28, 0.24], rx: 0,   rz: -1.1 },
            // 臀部斑
            { pos: [0.20, 0.72, -0.48],  scale: [0.22, 0.18, 0.20], rx: 0.5, rz:  0.2 },
            // 肩部小斑
            { pos: [-0.30, 0.88, 0.38],  scale: [0.14, 0.12, 0.18], rx: 0,   rz: -0.3 },
        ];
        spotDefs.forEach(({ pos, scale, rx, rz }) => {
            const sGeo = new THREE.SphereGeometry(1, 10, 8);
            const spot = new THREE.Mesh(sGeo, spotMat);
            spot.scale.set(...scale);
            spot.position.set(...pos);
            spot.rotation.x = rx;
            spot.rotation.z = rz;
            group.add(spot);
        });

        // ===== 颈部 - 粗壮，连接头部与身体 =====
        const neckGeo = new THREE.CylinderGeometry(0.18, 0.22, 0.30, 8);
        const neck = new THREE.Mesh(neckGeo, neckMat);
        neck.position.set(0, 0.72, 0.44);
        neck.rotation.x = Math.PI / 2.2;  // 前倾
        group.add(neck);

        // ===== 头部 - 扁平宽阔，倒梯形，额头宽下颌窄 =====
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.78, 0.72);
        group.add(headGroup);

        // 头部主体 - 扁平宽阔（宽>高>深）
        const headGeo = new THREE.BoxGeometry(0.52, 0.38, 0.44);
        const headMesh = new THREE.Mesh(headGeo, bodyMat);
        headMesh.castShadow = true;
        headGroup.add(headMesh);

        // 头部圆角感 - 在BoxGeometry基础上叠加圆润感
        const headRoundGeo = new THREE.SphereGeometry(0.22, 10, 8);
        const headRound = new THREE.Mesh(headRoundGeo, bodyMat);
        headRound.scale.set(1.18, 0.86, 1.0);
        headGroup.add(headRound);

        // 头部黑斑（左眼周围）
        const headSpotGeo = new THREE.SphereGeometry(0.12, 8, 8);
        const headSpot = new THREE.Mesh(headSpotGeo, spotMat);
        headSpot.scale.set(1.0, 0.85, 0.5);
        headSpot.position.set(-0.18, 0.04, 0.20);
        headGroup.add(headSpot);

        // ===== 眼睛 - 大而温和，位于头部两侧 =====
        const earGroups = [];
        [[-0.20, 0.04, 0.18], [0.20, 0.04, 0.18]].forEach(([ex, ey, ez]) => {
            // 眼白
            const ewGeo = new THREE.SphereGeometry(0.072, 10, 10);
            const ewMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
            const ew = new THREE.Mesh(ewGeo, ewMat);
            ew.scale.set(1, 1, 0.55);
            ew.position.set(ex, ey, ez);
            headGroup.add(ew);
            // 深棕瞳孔
            const pupilGeo = new THREE.SphereGeometry(0.052, 10, 10);
            const pupil = new THREE.Mesh(pupilGeo, eyeMat);
            pupil.scale.set(1, 1, 0.55);
            pupil.position.set(ex, ey, ez + 0.01);
            headGroup.add(pupil);
            // 高光
            const hlGeo = new THREE.SphereGeometry(0.020, 6, 6);
            const hl = new THREE.Mesh(hlGeo, eyeHighMat);
            hl.position.set(ex + 0.018, ey + 0.022, ez + 0.038);
            headGroup.add(hl);
        });

        // ===== 鼻镜 - 宽大矩形，粉色，鼻孔朝下 =====
        // 宽大矩形鼻镜，占头部下方1/3
        const nosePadGeo = new THREE.BoxGeometry(0.32, 0.16, 0.08);
        const nosePad = new THREE.Mesh(nosePadGeo, noseMat);
        nosePad.position.set(0, -0.14, 0.22);
        headGroup.add(nosePad);
        // 鼻镜圆角
        const noseRoundGeo = new THREE.SphereGeometry(0.14, 10, 8);
        const noseRound = new THREE.Mesh(noseRoundGeo, noseMat);
        noseRound.scale.set(1.14, 0.57, 0.29);
        noseRound.position.set(0, -0.14, 0.22);
        headGroup.add(noseRound);
        // 两个大鼻孔（朝下）
        [-0.09, 0.09].forEach(nx => {
            const nGeo = new THREE.SphereGeometry(0.038, 8, 6);
            const n = new THREE.Mesh(nGeo, nostrilMat);
            n.scale.set(1.3, 0.5, 1.0);
            n.position.set(nx, -0.20, 0.22);
            headGroup.add(n);
        });

        // ===== 犄角 - 短小弯曲向上，米黄色 =====
        [-1, 1].forEach(side => {
            const hornGroup = new THREE.Group();
            hornGroup.position.set(side * 0.22, 0.20, -0.02);
            // 犄角根部
            const hornBaseGeo = new THREE.CylinderGeometry(0.030, 0.038, 0.12, 6);
            const hornBase = new THREE.Mesh(hornBaseGeo, hornMat);
            hornBase.rotation.z = side * 0.5;
            hornBase.rotation.x = -0.2;
            hornGroup.add(hornBase);
            // 犄角弯曲尖端
            const hornTipGeo = new THREE.CylinderGeometry(0.012, 0.028, 0.10, 6);
            const hornTip = new THREE.Mesh(hornTipGeo, hornMat);
            hornTip.position.set(side * 0.06, 0.10, -0.02);
            hornTip.rotation.z = side * 0.9;
            hornTip.rotation.x = -0.1;
            hornGroup.add(hornTip);
            // 圆润尖端球
            const tipGeo = new THREE.SphereGeometry(0.014, 6, 6);
            const tip = new THREE.Mesh(tipGeo, hornMat);
            tip.position.set(side * 0.10, 0.16, -0.03);
            hornGroup.add(tip);
            headGroup.add(hornGroup);
        });

        // ===== 耳朵 - 水平向外伸展，叶片形，内侧粉色 =====
        [-1, 1].forEach(side => {
            const earGroup = new THREE.Group();
            // 水平向外：z轴旋转使耳朵水平伸出
            earGroup.position.set(side * 0.26, 0.10, 0.02);
            earGroup.rotation.z = side * (Math.PI / 2 - 0.3); // 接近水平
            // 耳朵外层 - 叶片形
            const earGeo = new THREE.SphereGeometry(0.11, 8, 8);
            const ear = new THREE.Mesh(earGeo, bodyMat);
            ear.scale.set(0.65, 1.5, 0.35);
            earGroup.add(ear);
            // 耳内粉色
            const earInGeo = new THREE.SphereGeometry(0.08, 8, 8);
            const earIn = new THREE.Mesh(earInGeo, earInnerMat);
            earIn.scale.set(0.45, 1.15, 0.25);
            earIn.position.set(0, 0, 0.02);
            earGroup.add(earIn);
            headGroup.add(earGroup);
            earGroups.push(earGroup);
        });

        // ===== 四条腿 - 中等长度，直立稳健 =====
        // 腿长0.38，约为总高1/3，比猪腿明显更长
        const legGeo = new THREE.CylinderGeometry(0.092, 0.092, 0.38, 8);
        const legDefs = [
            { name: 'frontLeft',  x: -0.24, z:  0.36 },
            { name: 'frontRight', x:  0.24, z:  0.36 },
            { name: 'backLeft',   x: -0.24, z: -0.36 },
            { name: 'backRight',  x:  0.24, z: -0.36 }
        ];
        const legGroups = {};
        legDefs.forEach(({ name, x, z }) => {
            const lg = new THREE.Group();
            lg.position.set(x, 0.38, z);
            lg.rotation.z = (x < 0 ? -1 : 1) * 0.04; // 轻微外八
            const leg = new THREE.Mesh(legGeo, legMat);
            lg.add(leg);
            // 偶蹄 - 深灰色，两瓣可见
            const hoofGeo = new THREE.BoxGeometry(0.16, 0.10, 0.18);
            const hoof = new THREE.Mesh(hoofGeo, hoofMat);
            hoof.position.y = -0.22;
            lg.add(hoof);
            // 蹄缝（两瓣分叉线）
            const cleftGeo = new THREE.BoxGeometry(0.02, 0.12, 0.20);
            const cleftMat = new THREE.MeshLambertMaterial({ color: 0x222222 });
            const cleft = new THREE.Mesh(cleftGeo, cleftMat);
            cleft.position.y = -0.22;
            lg.add(cleft);
            group.add(lg);
            legGroups[name] = lg;
        });

        // ===== 乳房 - 位于后腿之间腹下，明显可见 =====
        const udderGeo = new THREE.SphereGeometry(0.16, 10, 8);
        const udder = new THREE.Mesh(udderGeo, udderMat);
        udder.scale.set(1.5, 0.65, 1.2);
        udder.position.set(0, 0.26, -0.28);
        group.add(udder);
        // 4个乳头
        [[-0.08, -0.12], [0.08, -0.12], [-0.08, 0.06], [0.08, 0.06]].forEach(([tx, tz]) => {
            const tGeo = new THREE.CylinderGeometry(0.022, 0.018, 0.06, 6);
            const tMat = new THREE.MeshLambertMaterial({ color: 0xF0B0B8 });
            const t = new THREE.Mesh(tGeo, tMat);
            t.position.set(tx, 0.18, tz - 0.28);
            group.add(t);
        });

        // ===== 尾巴 - 细长，末端蓬松毛刷，自然下垂 =====
        const tailGroup = new THREE.Group();
        tailGroup.position.set(0, 0.62, -0.52);
        // 尾杆（细长）
        const tailGeo = new THREE.CylinderGeometry(0.016, 0.012, 0.45, 5);
        const tailStick = new THREE.Mesh(tailGeo, tailMat);
        tailStick.rotation.x = Math.PI / 6;  // 自然下垂角度
        tailStick.position.set(0, -0.22, -0.10);
        tailGroup.add(tailStick);
        // 末端毛刷（蓬松球）
        const tuftGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const tuft = new THREE.Mesh(tuftGeo, tailMat);
        tuft.scale.set(1.2, 1.5, 1.2);
        tuft.position.set(0, -0.48, -0.22);
        tailGroup.add(tuft);
        group.add(tailGroup);

        // ===== 存储部件引用，供动画系统使用 =====
        group.userData.parts = {
            body, headGroup,
            frontLeft:  legGroups.frontLeft,
            frontRight: legGroups.frontRight,
            backLeft:   legGroups.backLeft,
            backRight:  legGroups.backRight,
            tail: tailGroup,
            leftEar:  earGroups[0],
            rightEar: earGroups[1]
        };
        group.userData.baseBodyPos = body.position.clone();
        group.userData.baseHeadPos = headGroup.position.clone();
    },



    // 创建猪模型
    _buildPig(group, color) {
        const bodyMat = new THREE.MeshLambertMaterial({ color: color || 0xffb6c1 });
        const snoutMat = new THREE.MeshLambertMaterial({ color: 0xff9aaa });
        const eyeMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
        const legMat = new THREE.MeshLambertMaterial({ color: 0xffaabb });

        // 身体 - 滚圆桶形
        const bodyGeo = new THREE.SphereGeometry(0.38, 10, 8);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.scale.set(1.1, 0.85, 1.4);
        body.position.set(0, 0.38, 0);
        body.castShadow = true;
        group.add(body);

        // 头部 - 大型，与身体比例约1:3
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.5, 0.46);
        const headGeo = new THREE.SphereGeometry(0.26, 10, 8);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.scale.set(1, 0.9, 1);
        head.castShadow = true;
        headGroup.add(head);

        // 鼻子 - 扁平圆盘状（关键特征）
        const snoutGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.06, 12);
        const snout = new THREE.Mesh(snoutGeo, snoutMat);
        snout.rotation.x = Math.PI / 2;
        snout.position.set(0, -0.04, 0.24);
        headGroup.add(snout);
        // 鼻孔
        const nostrilGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.04, 8);
        const nostrilMat = new THREE.MeshLambertMaterial({ color: 0xcc7788 });
        [-0.05, 0.05].forEach(nx => {
            const nostril = new THREE.Mesh(nostrilGeo, nostrilMat);
            nostril.rotation.x = Math.PI / 2;
            nostril.position.set(nx, -0.04, 0.27);
            headGroup.add(nostril);
        });

        // 耳朵 - 大型三角形，前倾
        [-1, 1].forEach(side => {
            const earGeo = new THREE.ConeGeometry(0.1, 0.18, 4);
            const ear = new THREE.Mesh(earGeo, bodyMat);
            ear.position.set(side * 0.2, 0.2, -0.05);
            ear.rotation.z = side * 0.3;
            ear.rotation.x = 0.3;
            headGroup.add(ear);
        });

        // 眼睛
        const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);
        [-0.1, 0.1].forEach(ex => {
            const eye = new THREE.Mesh(eyeGeo, eyeMat);
            eye.position.set(ex, 0.06, 0.22);
            headGroup.add(eye);
        });

        group.add(headGroup);

        // 四条腿 - 短粗
        const legGeo = new THREE.CylinderGeometry(0.075, 0.065, 0.28, 6);
        const legPositions = [
            { name: 'frontLeft', x: -0.18, z: 0.26 },
            { name: 'frontRight', x: 0.18, z: 0.26 },
            { name: 'backLeft', x: -0.18, z: -0.26 },
            { name: 'backRight', x: 0.18, z: -0.26 }
        ];
        const legGroups = {};
        legPositions.forEach(({ name, x, z }) => {
            const lg = new THREE.Group();
            lg.position.set(x, 0.14, z);
            const leg = new THREE.Mesh(legGeo, legMat);
            lg.add(leg);
            const hoofGeo = new THREE.BoxGeometry(0.1, 0.06, 0.1);
            const hoofMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
            const hoof = new THREE.Mesh(hoofGeo, hoofMat);
            hoof.position.y = -0.17;
            lg.add(hoof);
            group.add(lg);
            legGroups[name] = lg;
        });

        // 尾巴 - 卷曲螺旋状（关键特征）
        const tailGroup = new THREE.Group();
        tailGroup.position.set(0, 0.42, -0.5);
        // 用多段模拟螺旋卷尾
        for (let i = 0; i < 6; i++) {
            const tGeo = new THREE.SphereGeometry(0.03 - i * 0.003, 5, 5);
            const tMesh = new THREE.Mesh(tGeo, bodyMat);
            const angle = i * 1.2;
            const r = 0.06 - i * 0.005;
            tMesh.position.set(Math.cos(angle) * r, -i * 0.03, Math.sin(angle) * r);
            tailGroup.add(tMesh);
        }
        group.add(tailGroup);

        group.userData.parts = {
            body, headGroup,
            frontLeft: legGroups.frontLeft, frontRight: legGroups.frontRight,
            backLeft: legGroups.backLeft, backRight: legGroups.backRight,
            tail: tailGroup, snout
        };
        group.userData.baseBodyRot = 0;
        group.userData.baseSnoutPos = snout.position.clone();
        group.userData.baseHeadPos = headGroup.position.clone();
    },

    // 创建鸭子模型
    _buildDuck(group, color) {
        const bodyMat = new THREE.MeshLambertMaterial({ color: color || 0x88aaff });
        const billMat = new THREE.MeshLambertMaterial({ color: 0xffaa00 });
        const legMat  = new THREE.MeshLambertMaterial({ color: 0xffaa00 });
        const eyeMat  = new THREE.MeshLambertMaterial({ color: 0x111111 });
        const whiteMat = new THREE.MeshLambertMaterial({ color: 0xffffff });

        // 身体 - 圆润椭球，尾部上翘
        const bodyGeo = new THREE.SphereGeometry(0.22, 10, 8);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.scale.set(1.0, 0.85, 1.3);
        body.position.set(0, 0.26, 0);
        body.castShadow = true;
        group.add(body);

        // 胸部白色斑块（关键识别特征）
        const chestGeo = new THREE.SphereGeometry(0.14, 8, 8);
        const chest = new THREE.Mesh(chestGeo, whiteMat);
        chest.scale.set(0.9, 0.8, 0.5);
        chest.position.set(0, 0.22, 0.2);
        group.add(chest);

        // 头部 - 圆润
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.48, 0.22);
        const headGeo = new THREE.SphereGeometry(0.14, 8, 8);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.castShadow = true;
        headGroup.add(head);

        // 扁平鸭嘴（关键识别特征）
        const billGeo = new THREE.BoxGeometry(0.12, 0.04, 0.12);
        const bill = new THREE.Mesh(billGeo, billMat);
        bill.position.set(0, -0.02, 0.15);
        headGroup.add(bill);

        // 眼睛
        const eyeGeo = new THREE.SphereGeometry(0.025, 6, 6);
        [-0.07, 0.07].forEach(ex => {
            const eye = new THREE.Mesh(eyeGeo, eyeMat);
            eye.position.set(ex, 0.04, 0.1);
            headGroup.add(eye);
        });

        group.add(headGroup);

        // 翅膀
        [-1, 1].forEach(side => {
            const wingGeo = new THREE.SphereGeometry(0.1, 6, 6);
            const wing = new THREE.Mesh(wingGeo, bodyMat);
            wing.scale.set(0.45, 0.65, 1.1);
            wing.position.set(side * 0.22, 0.28, 0);
            group.add(wing);
        });

        // 尾羽 - 上翘（鸭子特征）
        const tailGeo = new THREE.ConeGeometry(0.07, 0.18, 5);
        const tail = new THREE.Mesh(tailGeo, bodyMat);
        tail.rotation.x = -Math.PI / 2.5;
        tail.position.set(0, 0.36, -0.22);
        group.add(tail);

        // 腿 - 橙黄色短腿
        const legGeo = new THREE.CylinderGeometry(0.025, 0.02, 0.18, 5);
        const leftLegGroup = new THREE.Group();
        leftLegGroup.position.set(-0.07, 0.09, 0.02);
        const leftLeg = new THREE.Mesh(legGeo, legMat);
        leftLeg.position.y = -0.09;
        leftLegGroup.add(leftLeg);
        // 蹼足
        const webGeo = new THREE.ConeGeometry(0.07, 0.04, 3);
        const webL = new THREE.Mesh(webGeo, billMat);
        webL.rotation.x = Math.PI / 2;
        webL.position.set(0, -0.19, 0.03);
        leftLegGroup.add(webL);
        group.add(leftLegGroup);

        const rightLegGroup = new THREE.Group();
        rightLegGroup.position.set(0.07, 0.09, 0.02);
        const rightLeg = new THREE.Mesh(legGeo, legMat);
        rightLeg.position.y = -0.09;
        rightLegGroup.add(rightLeg);
        const webR = new THREE.Mesh(webGeo, billMat);
        webR.rotation.x = Math.PI / 2;
        webR.position.set(0, -0.19, 0.03);
        rightLegGroup.add(webR);
        group.add(rightLegGroup);

        group.userData.parts = {
            body, headGroup,
            leftLeg: leftLegGroup, rightLeg: rightLegGroup,
            tail
        };
        group.userData.baseHeadPos = headGroup.position.clone();
        group.userData.baseBodyY = body.position.y;
    },

    // 添加动物到场景

    addAnimalMesh(animal) {
        const animalData = ANIMALS_DATA[animal.type];
        if (!animalData) return;

        const group = new THREE.Group();
        const angle = (this.animalMeshes.length / 8) * Math.PI * 2;
        const radius = 8;
        group.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
        group.userData = { animalId: animal.id, type: 'animal' };

        // 根据动物类型构建对应模型
        switch (animal.type) {
            case 'chicken': this._buildChicken(group, animalData.color); break;
            case 'duck':    this._buildDuck(group, animalData.color);    break;
            case 'sheep':   this._buildSheep(group, animalData.color);   break;
            case 'cow':     this._buildCow(group, animalData.color);     break;
            case 'pig':     this._buildPig(group, animalData.color);     break;
            default:        this._buildChicken(group, animalData.color); break;
        }


        // 产出标记
        if (animal.hasProduct) {
            const markerGeo = new THREE.SphereGeometry(0.2, 8, 8);
            const markerMat = new THREE.MeshLambertMaterial({ color: 0xffd700 });
            const marker = new THREE.Mesh(markerGeo, markerMat);
            // 根据动物大小调整标记高度
            const heights = { chicken: 1.2, duck: 1.1, sheep: 1.8, cow: 1.1, pig: 1.6 };

            marker.position.y = heights[animal.type] || 1.8;

            marker.userData = { isProductMarker: true };
            group.add(marker);
        }

        // ===== 行为状态机初始化 =====
        const speeds = { chicken: 2.0, duck: 1.8, sheep: 1.5, cow: 1.0, pig: 1.2 };
        const stepFreqs = { chicken: 4.0, duck: 3.5, sheep: 2.0, cow: 1.5, pig: 2.5 };


        group.userData.animalType = animal.type;
        group.userData.animPhase = Math.random() * Math.PI * 2;
        group.userData.walkSpeed = speeds[animal.type] || 1.5;
        group.userData.stepFreq = stepFreqs[animal.type] || 2.0;

        // 行为状态
        group.userData.state = 'wandering';   // idle / wandering / foraging / resting / social
        group.userData.stateTimer = 5 + Math.random() * 10;
        group.userData.restTimer = 0;

        // 移动目标
        group.userData.targetX = group.position.x;
        group.userData.targetZ = group.position.z;
        group.userData.moveTimer = 0;

        // 朝向
        group.userData.facingAngle = Math.random() * Math.PI * 2;

        this.scene.add(group);
        this.animalMeshes.push(group);
        return group;
    },

    
    // 移除动物
    removeAnimalMesh(animalId) {
        const idx = this.animalMeshes.findIndex(m => m.userData.animalId === animalId);
        if (idx !== -1) {
            this.scene.remove(this.animalMeshes[idx]);
            this.animalMeshes.splice(idx, 1);
        }
    },
    
    // 更新动物产出标记
    updateAnimalProductMarker(animalId, hasProduct) {
        const mesh = this.animalMeshes.find(m => m.userData.animalId === animalId);
        if (!mesh) return;

        const existing = mesh.children.find(c => c.userData.isProductMarker);
        if (hasProduct && !existing) {
            const markerGeo = new THREE.SphereGeometry(0.2, 8, 8);
            const markerMat = new THREE.MeshLambertMaterial({ color: 0xffd700 });
            const marker = new THREE.Mesh(markerGeo, markerMat);
            const heights = { chicken: 1.2, duck: 1.1, sheep: 1.8, cow: 1.1, pig: 1.6 };
            marker.position.y = heights[mesh.userData.animalType] || 1.8;

            marker.userData = { isProductMarker: true };
            mesh.add(marker);
        } else if (!hasProduct && existing) {
            mesh.remove(existing);
        }
    },

    
    // 创建收获粒子特效
    createHarvestEffect(plotId, color) {
        const plot = this.plotMeshes[plotId];
        if (!plot) return;
        
        for (let i = 0; i < 15; i++) {
            const geo = new THREE.SphereGeometry(0.08, 6, 6);
            const mat = new THREE.MeshLambertMaterial({ color: color || 0xffd700 });
            const particle = new THREE.Mesh(geo, mat);
            particle.position.copy(plot.position);
            particle.position.y = 1;
            particle.userData = {
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 3,
                    2 + Math.random() * 3,
                    (Math.random() - 0.5) * 3
                ),
                life: 1.0,
                type: 'particle'
            };
            this.scene.add(particle);
            this.particles.push(particle);
        }
    },
    
    // 创建浇水特效
    createWaterEffect(plotId) {
        const plot = this.plotMeshes[plotId];
        if (!plot) return;
        
        // 土地颜色变深（湿润效果）
        if (typeof SceneBeautify !== 'undefined') {
            SceneBeautify.updatePlotWater(plot, true);
            // 30秒后渐变恢复干燥
            plot.userData.waterTimer = 30;
        }
        
        for (let i = 0; i < 8; i++) {

            const geo = new THREE.SphereGeometry(0.06, 6, 6);
            const mat = new THREE.MeshLambertMaterial({ color: 0x4488ff, transparent: true, opacity: 0.8 });
            const drop = new THREE.Mesh(geo, mat);
            drop.position.copy(plot.position);
            drop.position.y = 2;
            drop.position.x += (Math.random() - 0.5) * 2;
            drop.position.z += (Math.random() - 0.5) * 2;
            drop.userData = {
                velocity: new THREE.Vector3(0, -2, 0),
                life: 0.8,
                type: 'particle'
            };
            this.scene.add(drop);
            this.particles.push(drop);
        }
    },
    
    // 设置事件
    setupEvents() {
        const canvas = document.getElementById('gameCanvas');
        
        // 鼠标点击
        canvas.addEventListener('click', (e) => {
            if (this.isDragging) return;
            this.handleClick(e);
        });
        
        // 鼠标拖拽（旋转相机）
        canvas.addEventListener('mousedown', (e) => {
            this.isDragging = false;
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
            this._mouseDown = true;
        });
        
        canvas.addEventListener('mousemove', (e) => {
            if (!this._mouseDown) return;
            const dx = e.clientX - this.lastMouseX;
            const dy = e.clientY - this.lastMouseY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) this.isDragging = true;
            
            if (this.isDragging) {
                this.cameraAngle -= dx * 0.01;
                this.cameraHeight = Math.max(5, Math.min(25, this.cameraHeight - dy * 0.05));
                this.updateCamera();
            }
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
        });
        
        canvas.addEventListener('mouseup', () => { this._mouseDown = false; });
        
        // 滚轮缩放
        canvas.addEventListener('wheel', (e) => {
            this.cameraDistance = Math.max(8, Math.min(30, this.cameraDistance + e.deltaY * 0.02));
            this.updateCamera();
        });
        
        // 触摸支持
        let lastTouchX = 0, lastTouchY = 0, touchStartX = 0, touchStartY = 0;
        canvas.addEventListener('touchstart', (e) => {
            touchStartX = lastTouchX = e.touches[0].clientX;
            touchStartY = lastTouchY = e.touches[0].clientY;
            this.isDragging = false;
        });
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const dx = e.touches[0].clientX - lastTouchX;
            const dy = e.touches[0].clientY - lastTouchY;
            if (Math.abs(e.touches[0].clientX - touchStartX) > 5) this.isDragging = true;
            this.cameraAngle -= dx * 0.01;
            this.cameraHeight = Math.max(5, Math.min(25, this.cameraHeight - dy * 0.05));
            this.updateCamera();
            lastTouchX = e.touches[0].clientX;
            lastTouchY = e.touches[0].clientY;
        }, { passive: false });
        canvas.addEventListener('touchend', (e) => {
            if (!this.isDragging) {
                const touch = e.changedTouches[0];
                this.handleClick({ clientX: touch.clientX, clientY: touch.clientY });
            }
        });
    },
    
    // 处理点击
    handleClick(e) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2(
            (e.clientX / window.innerWidth) * 2 - 1,
            -(e.clientY / window.innerHeight) * 2 + 1
        );
        raycaster.setFromCamera(mouse, this.camera);
        
        // 检测土地点击
        const plotObjects = this.plotMeshes.map(g => g.children[0]);
        const plotIntersects = raycaster.intersectObjects(plotObjects);
        if (plotIntersects.length > 0) {
            const plotGroup = plotIntersects[0].object.parent;
            const plotId = plotGroup.userData.plotId;
            onPlotClick(plotId, e.clientX, e.clientY);
            return;
        }
        
        // 检测动物点击
        const animalObjects = this.animalMeshes.map(g => g.children[0]);
        const animalIntersects = raycaster.intersectObjects(animalObjects);
        if (animalIntersects.length > 0) {
            const animalGroup = animalIntersects[0].object.parent;
            const animalId = animalGroup.userData.animalId;
            onAnimalClick(animalId, e.clientX, e.clientY);
            return;
        }
        
        // 关闭菜单
        hideAllMenus();
    },
    
    // 高亮土地
    highlightPlot(plotId, highlight) {
        const group = this.plotMeshes[plotId];
        if (!group) return;
        const soil = group.children[0];
        if (highlight) {
            soil.material.emissive = new THREE.Color(0x224422);
        } else {
            soil.material.emissive = new THREE.Color(0x000000);
        }
    },
    
    // 更新场景
    update(deltaTime) {
        const time = Date.now() * 0.001;
        
        // 风车旋转
        if (this.windmillBlades) {
            this.windmillBlades.rotation.z += deltaTime * 1.5;
        }
        
        // 云朵移动
        if (this.clouds) {
            this.clouds.forEach(cloud => {
                cloud.position.x += cloud.userData.speed * deltaTime;
                if (cloud.position.x > 40) cloud.position.x = -40;
            });
        }
        
        // 氛围粒子动画（蝴蝶/蜜蜂/花瓣）
        if (typeof SceneBeautify !== 'undefined') {
            SceneBeautify.updateParticles(deltaTime, time);
        }

        // 作物动画：随风摇摆 + 成熟跳动
        this.cropMeshes.forEach((mesh, i) => {

            if (!mesh) return;
            // 随风摇摆
            if (typeof PlantAnimator !== 'undefined' && mesh.userData.cropId) {
                PlantAnimator.updateSway(mesh, mesh.userData.cropId, time);
            }
            // 成熟跳动
            if (mesh.userData.bouncing) {
                mesh.userData.bounceTime += deltaTime * 2;
                mesh.position.y = 0.3 + Math.sin(mesh.userData.bounceTime) * 0.05;
            }
        });

        
        // 动物行为状态机 + 四肢动画
        this.animalMeshes.forEach(mesh => {
            const ud = mesh.userData;
            if (!ud.animalType) return;

            const parts = ud.parts || {};

            // ---- 行为状态机 ----
            ud.stateTimer -= deltaTime;
            ud.moveTimer -= deltaTime;

            if (ud.stateTimer <= 0) {
                // 随机切换行为意图
                const roll = Math.random();
                const weights = {
                    chicken: { foraging: 0.35, wandering: 0.35, resting: 0.15, social: 0.15 },
                    duck:    { foraging: 0.35, wandering: 0.35, resting: 0.15, social: 0.15 },
                    sheep:   { foraging: 0.40, wandering: 0.25, resting: 0.20, social: 0.15 },
                    cow:     { foraging: 0.45, wandering: 0.20, resting: 0.25, social: 0.10 },
                    pig:     { foraging: 0.40, wandering: 0.30, resting: 0.15, social: 0.15 }
                };
                const w = weights[ud.animalType] || weights.chicken;

                if (roll < w.resting) {
                    ud.state = 'resting';
                    ud.stateTimer = 8 + Math.random() * 15;
                } else if (roll < w.resting + w.foraging) {
                    ud.state = 'foraging';
                    ud.stateTimer = 10 + Math.random() * 20;
                } else if (roll < w.resting + w.foraging + w.social) {
                    ud.state = 'social';
                    ud.stateTimer = 6 + Math.random() * 10;
                } else {
                    ud.state = 'wandering';
                    ud.stateTimer = 8 + Math.random() * 15;
                }
            }

            // ---- 移动目标更新 ----
            const isMoving = (ud.state !== 'resting');
            if (isMoving && ud.moveTimer <= 0) {
                // 根据行为选择移动模式
                let newX, newZ;
                if (ud.state === 'foraging') {
                    // 之字形觅食：小幅随机偏移
                    newX = mesh.position.x + (Math.random() - 0.5) * 4;
                    newZ = mesh.position.z + (Math.random() - 0.5) * 4;
                } else if (ud.state === 'social') {
                    // 向附近同类靠近
                    const sameKind = this.animalMeshes.filter(m => m !== mesh && m.userData.animalType === ud.animalType);
                    if (sameKind.length > 0) {
                        const target = sameKind[Math.floor(Math.random() * sameKind.length)];
                        newX = target.position.x + (Math.random() - 0.5) * 2;
                        newZ = target.position.z + (Math.random() - 0.5) * 2;
                    } else {
                        newX = mesh.position.x + (Math.random() - 0.5) * 5;
                        newZ = mesh.position.z + (Math.random() - 0.5) * 5;
                    }
                } else {
                    // 随机漫步：较大范围
                    newX = (Math.random() - 0.5) * 18;
                    newZ = (Math.random() - 0.5) * 18;
                }
                // 限制在围栏内
                ud.targetX = Math.max(-10, Math.min(10, newX));
                ud.targetZ = Math.max(-10, Math.min(10, newZ));
                ud.moveTimer = 2 + Math.random() * 4;
            }

            // ---- 移动执行 ----
            let actualSpeed = 0;
            if (isMoving) {
                const dx = ud.targetX - mesh.position.x;
                const dz = ud.targetZ - mesh.position.z;
                const dist = Math.sqrt(dx * dx + dz * dz);

                if (dist > 0.15) {
                    // 速度：觅食时慢，漫步时正常
                    const speedMult = ud.state === 'foraging' ? 0.6 : 1.0;
                    actualSpeed = ud.walkSpeed * speedMult * 0.5;
                    const moveX = (dx / dist) * actualSpeed * deltaTime;
                    const moveZ = (dz / dist) * actualSpeed * deltaTime;
                    mesh.position.x += moveX;
                    mesh.position.z += moveZ;

                    // 平滑转向
                    const targetAngle = Math.atan2(dx, dz);
                    let angleDiff = targetAngle - ud.facingAngle;
                    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                    ud.facingAngle += angleDiff * Math.min(1, deltaTime * 5);
                    mesh.rotation.y = ud.facingAngle;
                }
            }

            // ---- 四肢动画 ----
            ud.animPhase += deltaTime * ud.stepFreq * (actualSpeed > 0 ? 1 : 0.1);

            const phase = ud.animPhase;
            const isWalking = actualSpeed > 0.05;

            if (ud.animalType === 'chicken') {
                // 鸡：高频小碎步 + 头部前后点动
                const legSwing = isWalking ? Math.sin(phase * Math.PI * 2) * 0.7 : 0;
                if (parts.leftLeg) parts.leftLeg.rotation.x = legSwing;
                if (parts.rightLeg) parts.rightLeg.rotation.x = -legSwing;
                // 头部点动（鸡的标志性动作）
                if (parts.headGroup) {
                    const bob = isWalking
                        ? Math.sin((phase + 0.5) * Math.PI * 2) * 0.06
                        : 0;
                    parts.headGroup.position.z = ud.baseHeadPos.z + bob;
                    // 觅食时低头啄地
                    if (ud.state === 'foraging') {
                        parts.headGroup.rotation.x = 0.3 + Math.abs(Math.sin(phase * Math.PI * 3)) * 0.3;
                    } else {
                        parts.headGroup.rotation.x = 0;
                    }
                }
                // 身体微微上下起伏
                if (parts.body) {
                    parts.body.position.y = ud.baseBodyY + (isWalking ? Math.abs(Math.sin(phase * Math.PI * 4)) * 0.03 : 0);
                }

            } else if (ud.animalType === 'duck') {
                // 鸭子：摇摆步态 + 头部点动 + 尾羽上翘
                const legSwing = isWalking ? Math.sin(phase * Math.PI * 2) * 0.6 : 0;
                if (parts.leftLeg)  parts.leftLeg.rotation.x  = legSwing;
                if (parts.rightLeg) parts.rightLeg.rotation.x = -legSwing;
                // 身体左右摇摆（鸭子特征）
                if (parts.body && isWalking) {
                    parts.body.rotation.z = Math.sin(phase * Math.PI * 2) * 0.1;
                }
                // 头部点动
                if (parts.headGroup) {
                    const bob = isWalking ? Math.sin((phase + 0.5) * Math.PI * 2) * 0.05 : 0;
                    parts.headGroup.position.z = ud.baseHeadPos.z + bob;
                    parts.headGroup.rotation.x = ud.state === 'foraging' ? 0.25 : 0;
                }
                // 尾羽随步伐轻微抖动
                if (parts.tail && isWalking) {
                    parts.tail.rotation.y = Math.sin(phase * Math.PI * 4) * 0.15;
                }

            } else if (ud.animalType === 'sheep') {

                // 羊：四足对角步态
                const legSwingRad = isWalking ? 0.45 : 0;
                const d1 = Math.sin(phase * Math.PI * 2) * legSwingRad;
                const d2 = Math.sin((phase + 0.5) * Math.PI * 2) * legSwingRad;
                if (parts.frontLeft)  parts.frontLeft.rotation.x  = d1;
                if (parts.backRight)  parts.backRight.rotation.x  = d1 * 0.8;
                if (parts.frontRight) parts.frontRight.rotation.x = d2;
                if (parts.backLeft)   parts.backLeft.rotation.x   = d2 * 0.8;
                // 羊毛弹动
                if (parts.woolGroup && isWalking) {
                    const bounce = 1 + Math.abs(Math.sin(phase * Math.PI * 4)) * 0.04;
                    parts.woolGroup.scale.set(bounce, bounce, bounce);
                }
                // 尾巴左右摆动
                if (parts.tail) {
                    parts.tail.rotation.y = Math.sin(phase * Math.PI * 4) * 0.18;
                }
                // 吃草时低头
                if (parts.headGroup) {
                    parts.headGroup.rotation.x = ud.state === 'foraging' ? 0.5 : 0;
                }

            } else if (ud.animalType === 'cow') {
                // 牛：沉稳四足步态
                const legSwingRad = isWalking ? 0.35 : 0;
                const fp = Math.sin(phase * Math.PI * 2) * legSwingRad;
                const bp = Math.sin((phase + 0.25) * Math.PI * 2) * legSwingRad;
                if (parts.frontLeft)  parts.frontLeft.rotation.x  = fp;
                if (parts.frontRight) parts.frontRight.rotation.x = -fp;
                if (parts.backLeft)   parts.backLeft.rotation.x   = bp;
                if (parts.backRight)  parts.backRight.rotation.x  = -bp;
                // 身体左右轻微晃动
                if (parts.body && ud.baseBodyPos && isWalking) {
                    parts.body.position.x = ud.baseBodyPos.x + Math.sin(phase * Math.PI * 2) * 0.04;
                }
                // 尾巴自然摆动
                if (parts.tail) {
                    parts.tail.rotation.y = Math.sin(phase * Math.PI * 3) * 0.25;
                }
                // 偶尔耳朵扇动（通过头部轻微晃动模拟）
                if (parts.headGroup && Math.random() < 0.002) {
                    parts.headGroup.rotation.z = (Math.random() - 0.5) * 0.15;
                    setTimeout(() => { if (parts.headGroup) parts.headGroup.rotation.z = 0; }, 300);
                }

            } else if (ud.animalType === 'pig') {
                // 猪：短腿快速 + 身体左右摇摆
                const legSwingRad = isWalking ? 0.55 : 0;
                const lp = Math.sin(phase * Math.PI * 2) * legSwingRad;
                if (parts.frontLeft)  parts.frontLeft.rotation.x  = lp;
                if (parts.frontRight) parts.frontRight.rotation.x = -lp;
                if (parts.backLeft)   parts.backLeft.rotation.x   = -lp * 0.9;
                if (parts.backRight)  parts.backRight.rotation.x  = lp * 0.9;
                // 身体明显左右摇摆（猪的特征）
                if (parts.body && isWalking) {
                    parts.body.rotation.z = Math.sin(phase * Math.PI * 2) * 0.08;
                }
                // 鼻子上下嗅动
                if (parts.snout && ud.baseSnoutPos) {
                    parts.snout.position.y = ud.baseSnoutPos.y + Math.sin(phase * Math.PI * 6) * 0.025;
                }
                // 卷尾轻微晃动
                if (parts.tail) {
                    parts.tail.rotation.y = Math.sin(phase * Math.PI * 4) * 0.3;
                }
                // 拱地时鼻子贴地
                if (parts.headGroup) {
                    parts.headGroup.rotation.x = ud.state === 'foraging' ? 0.35 : 0;
                }
            }
        });

        
        // 浇水土地颜色渐变恢复
        if (typeof SceneBeautify !== 'undefined') {
            this.plotMeshes.forEach(plot => {
                if (plot.userData.waterTimer > 0) {
                    plot.userData.waterTimer -= deltaTime;
                    if (plot.userData.waterTimer <= 0) {
                        SceneBeautify.updatePlotWater(plot, false);
                    }
                }
            });
        }

        // 粒子更新
        for (let i = this.particles.length - 1; i >= 0; i--) {

            const p = this.particles[i];
            p.userData.life -= deltaTime * 1.5;
            p.position.add(p.userData.velocity.clone().multiplyScalar(deltaTime));
            p.userData.velocity.y -= 5 * deltaTime;
            p.material.opacity = p.userData.life;
            p.material.transparent = true;
            if (p.userData.life <= 0) {
                this.scene.remove(p);
                this.particles.splice(i, 1);
            }
        }
        
        // 太阳光角度（昼夜变化）
        const sunAngle = time * 0.05;
        this.sunLight.position.set(
            Math.cos(sunAngle) * 30,
            Math.abs(Math.sin(sunAngle)) * 30 + 5,
            Math.sin(sunAngle) * 20
        );
        
        // 天空颜色变化
        const skyBrightness = Math.max(0.3, Math.abs(Math.sin(sunAngle)));
        this.scene.background = new THREE.Color(
            0.53 * skyBrightness,
            0.81 * skyBrightness,
            0.98 * skyBrightness
        );
        this.ambientLight.intensity = 0.3 + skyBrightness * 0.5;

        // 天地融合动画更新（雾色同步、云朵飘移、飞鸟飞行）
        if (typeof SceneHorizon !== 'undefined') {
            SceneHorizon.update(this.scene, deltaTime, time, skyBrightness);
        }
    },

    
    // 渲染
    render() {
        this.renderer.render(this.scene, this.camera);
    }
};
