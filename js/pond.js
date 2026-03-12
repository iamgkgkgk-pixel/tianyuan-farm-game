// ===== 池塘系统 =====
// 池塘中心坐标（左上角区域，远离土壤地块）
const POND_CENTER = { x: -14, z: 11 };
// 不规则湖泊的近似包围椭圆（用于碰撞检测）
const POND_RADIUS_X = 5.0;
const POND_RADIUS_Z = 4.0;
// 障碍缓冲区（动物绕行时额外外扩）
const POND_BUFFER = 0.5;

// 不规则湖泊顶点（相对于POND_CENTER的偏移，顺时针）
const POND_SHAPE_POINTS = [
    [ 4.5,  0.5],  // 右侧突出
    [ 3.8,  2.5],  // 右上
    [ 1.5,  4.0],  // 上方
    [-1.0,  3.8],  // 左上
    [-3.5,  2.8],  // 左上角
    [-5.0,  0.8],  // 左侧
    [-4.8, -1.5],  // 左下
    [-3.0, -3.5],  // 下方凹入
    [-0.5, -4.2],  // 下方
    [ 2.0, -3.8],  // 右下
    [ 4.0, -2.0],  // 右下角
    [ 4.5,  0.5],  // 回到起点
];

// 钓鱼点配置（跟随湖泊新位置）
const FISHING_SPOTS = [
    { id: 0, x: POND_CENTER.x + 4.8, z: POND_CENTER.z - 0.5, label: '右侧钓鱼点' },
    { id: 1, x: POND_CENTER.x,       z: POND_CENTER.z + 4.2, label: '上方钓鱼点' }
];


const PondSystem = {
    scene: null,
    pondMesh: null,
    pondBottomMesh: null,
    reedGroups: [],
    fishingSpotMeshes: [],
    ripples: [],          // 涟漪列表 [{mesh, age, maxAge}]
    fishShadows: [],      // 鱼影列表
    dragonflies: [],      // 蜻蜓
    frog: null,
    duckWakes: [],        // 鸭子划水尾波

    // ===== 初始化 =====
    init(scene) {
        this.scene = scene;
        this._createPondBase();
        this._createShoreDecoration();
        this._createFishingSpots();
        this._createFishShadows();
        this._createDragonflies();
        this._createFrog();
    },

    // ===== 构建不规则湖泊Shape =====
    _buildPondShape(scale = 1.0) {
        const pts = POND_SHAPE_POINTS.map(([x, z]) => new THREE.Vector2(x * scale, z * scale));
        return new THREE.Shape(pts);
    },

    // ===== 池塘主体 =====
    _createPondBase() {
        // 池底（深蓝绿色，略小于水面）
        const bottomShape = this._buildPondShape(0.92);
        const bottomExtGeo = new THREE.ShapeGeometry(bottomShape);
        const bottomMat = new THREE.MeshLambertMaterial({ color: 0x2D5A5A, side: THREE.DoubleSide });
        const bottom = new THREE.Mesh(bottomExtGeo, bottomMat);
        bottom.rotation.x = -Math.PI / 2;
        bottom.position.set(POND_CENTER.x, -0.05, POND_CENTER.z);
        bottom.receiveShadow = true;
        this.scene.add(bottom);
        this.pondBottomMesh = bottom;

        // 水面（浅蓝色半透明，不规则形状）
        const waterShape = this._buildPondShape(1.0);
        const waterGeo = new THREE.ShapeGeometry(waterShape);
        const waterMat = new THREE.MeshPhysicalMaterial({
            color: 0x7EC8E3,
            transparent: true,
            opacity: 0.72,
            roughness: 0.1,
            metalness: 0.0,
            reflectivity: 0.3,
            side: THREE.DoubleSide
        });
        const water = new THREE.Mesh(waterGeo, waterMat);
        water.rotation.x = -Math.PI / 2;
        water.position.set(POND_CENTER.x, 0.01, POND_CENTER.z);
        water.receiveShadow = true;
        this.scene.add(water);
        this.pondMesh = water;

        // 岸边过渡带（湿润泥土，外扩0.6，挖空内部）
        const shoreShape = this._buildPondShape(1.12);
        const holePath = new THREE.Path(
            POND_SHAPE_POINTS.map(([x, z]) => new THREE.Vector2(x, z))
        );
        shoreShape.holes.push(holePath);
        const shoreGeo = new THREE.ShapeGeometry(shoreShape);
        const shoreMat = new THREE.MeshLambertMaterial({ color: 0x5C4033, side: THREE.DoubleSide });
        const shore = new THREE.Mesh(shoreGeo, shoreMat);
        shore.rotation.x = -Math.PI / 2;
        shore.position.set(POND_CENTER.x, 0.001, POND_CENTER.z);
        shore.receiveShadow = true;
        this.scene.add(shore);


        // 鹅卵石（3-5块）
        const stonePositions = [
            [-0.5, 0.6], [0.8, -0.5], [-1.0, -0.8], [1.2, 0.3], [-0.3, -1.1]
        ];
        stonePositions.forEach(([ox, oz]) => {
            const r = 0.06 + Math.random() * 0.08;
            const stoneGeo = new THREE.SphereGeometry(r, 7, 5);
            const stoneMat = new THREE.MeshLambertMaterial({ color: 0x888880 });
            const stone = new THREE.Mesh(stoneGeo, stoneMat);
            stone.scale.set(1, 0.55, 1);
            stone.position.set(
                POND_CENTER.x + POND_RADIUS_X * 0.9 * Math.cos(Math.atan2(oz, ox)) + ox * 0.3,
                0.02,
                POND_CENTER.z + POND_RADIUS_Z * 0.9 * Math.sin(Math.atan2(oz, ox)) + oz * 0.3
            );
            this.scene.add(stone);
        });
    },

    // ===== 岸边装饰（芦苇） =====
    _createShoreDecoration() {
        const reedPositions = [
            { x: POND_CENTER.x - 3.2, z: POND_CENTER.z + 1.5, count: 4 },
            { x: POND_CENTER.x + 2.8, z: POND_CENTER.z - 1.2, count: 3 },
            { x: POND_CENTER.x - 1.0, z: POND_CENTER.z + 3.2, count: 5 }
        ];

        reedPositions.forEach(pos => {
            const group = new THREE.Group();
            group.position.set(pos.x, 0, pos.z);
            for (let i = 0; i < pos.count; i++) {
                const h = 0.6 + Math.random() * 0.5;
                const stemGeo = new THREE.CylinderGeometry(0.015, 0.02, h, 5);
                const stemMat = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
                const stem = new THREE.Mesh(stemGeo, stemMat);
                stem.position.set(
                    (Math.random() - 0.5) * 0.4,
                    h / 2,
                    (Math.random() - 0.5) * 0.4
                );
                stem.rotation.z = (Math.random() - 0.5) * 0.2;
                group.add(stem);

                // 穗头
                const headGeo = new THREE.SphereGeometry(0.04, 6, 4);
                const headMat = new THREE.MeshLambertMaterial({ color: 0x5C4A1E });
                const reedHead = new THREE.Mesh(headGeo, headMat);
                reedHead.scale.set(0.6, 2.0, 0.6);
                reedHead.position.copy(stem.position);
                reedHead.position.y += h / 2 + 0.06;
                group.add(reedHead);

                // 存储初始旋转用于风吹动画
                stem.userData.baseRotZ = stem.rotation.z;
                stem.userData.swayPhase = Math.random() * Math.PI * 2;
            }
            this.scene.add(group);
            this.reedGroups.push(group);
        });
    },

    // ===== 钓鱼点（木质小码头 + 钓竿图标） =====
    _createFishingSpots() {
        FISHING_SPOTS.forEach(spot => {
            const group = new THREE.Group();
            group.position.set(spot.x, 0, spot.z);

            // 木质小码头平台
            const dockGeo = new THREE.BoxGeometry(1.0, 0.08, 0.5);
            const dockMat = new THREE.MeshLambertMaterial({ color: 0x8B6914 });
            const dock = new THREE.Mesh(dockGeo, dockMat);
            dock.position.y = 0.04;
            dock.castShadow = true;
            group.add(dock);

            // 木板纹理（横条）
            for (let i = -2; i <= 2; i++) {
                const plankGeo = new THREE.BoxGeometry(0.95, 0.01, 0.08);
                const plankMat = new THREE.MeshLambertMaterial({ color: 0x7A5C10 });
                const plank = new THREE.Mesh(plankGeo, plankMat);
                plank.position.set(0, 0.085, i * 0.1);
                group.add(plank);
            }

            // 钓鱼竿（斜插）
            const rodGeo = new THREE.CylinderGeometry(0.015, 0.02, 0.8, 5);
            const rodMat = new THREE.MeshLambertMaterial({ color: 0x5C3A1E });
            const rod = new THREE.Mesh(rodGeo, rodMat);
            rod.rotation.z = Math.PI / 6;
            rod.position.set(0.3, 0.45, 0);
            group.add(rod);

            // 钓线（细线从竿尖到水面）
            const linePts = [
                new THREE.Vector3(0.3 + 0.4 * Math.sin(Math.PI / 6), 0.45 + 0.4 * Math.cos(Math.PI / 6), 0),
                new THREE.Vector3(0.3 + 0.8 * Math.sin(Math.PI / 6), 0.1, 0)
            ];
            const lineGeo = new THREE.BufferGeometry().setFromPoints(linePts);
            const lineMat = new THREE.LineBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.6 });
            const line = new THREE.Line(lineGeo, lineMat);
            group.add(line);

            // 交互提示标签（浮动文字用Sprite模拟）
            const labelCanvas = document.createElement('canvas');
            labelCanvas.width = 128; labelCanvas.height = 32;
            const ctx = labelCanvas.getContext('2d');
            ctx.fillStyle = 'rgba(0,0,0,0.6)';
            ctx.roundRect(0, 0, 128, 32, 6);
            ctx.fill();
            ctx.fillStyle = '#FFD700';
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('🎣 点击钓鱼', 64, 22);
            const labelTex = new THREE.CanvasTexture(labelCanvas);
            const labelMat = new THREE.SpriteMaterial({ map: labelTex, transparent: true });
            const label = new THREE.Sprite(labelMat);
            label.scale.set(1.2, 0.3, 1);
            label.position.set(0, 0.9, 0);
            group.add(label);

            group.userData = { type: 'fishingSpot', spotId: spot.id };

            // 添加不可见的大碰撞体，让点击更容易命中
            const hitboxGeo = new THREE.BoxGeometry(2.0, 1.5, 2.0);
            const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
            const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
            hitbox.position.set(0, 0.5, 0);
            group.add(hitbox);

            this.scene.add(group);

            this.fishingSpotMeshes.push(group);
        });
    },

    // ===== 鱼影（池底游动的模糊椭圆） =====
    _createFishShadows() {
        for (let i = 0; i < 3; i++) {
            const geo = new THREE.SphereGeometry(0.15 + Math.random() * 0.15, 8, 4);
            const mat = new THREE.MeshLambertMaterial({
                color: 0x1A3A3A,
                transparent: true,
                opacity: 0.35
            });
            const shadow = new THREE.Mesh(geo, mat);
            shadow.scale.set(1, 0.2, 0.6);
            // 随机初始位置（池塘内）
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * 0.7;
            shadow.position.set(
                POND_CENTER.x + Math.cos(angle) * POND_RADIUS_X * r,
                -0.03,
                POND_CENTER.z + Math.sin(angle) * POND_RADIUS_Z * r
            );
            shadow.userData = {
                angle: angle,
                speed: 0.2 + Math.random() * 0.3,
                radius: r,
                phase: Math.random() * Math.PI * 2,
                dartTimer: 5 + Math.random() * 10,
                isDarting: false,
                dartDir: 0
            };
            this.scene.add(shadow);
            this.fishShadows.push(shadow);
        }
    },

    // ===== 蜻蜓 =====
    _createDragonflies() {
        for (let i = 0; i < 2; i++) {
            const group = new THREE.Group();
            // 身体
            const bodyGeo = new THREE.CylinderGeometry(0.015, 0.01, 0.18, 5);
            const bodyMat = new THREE.MeshLambertMaterial({ color: i === 0 ? 0x4488ff : 0x44cc88 });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.rotation.z = Math.PI / 2;
            group.add(body);
            // 翅膀
            [-1, 1].forEach(side => {
                const wingGeo = new THREE.PlaneGeometry(0.18, 0.06);
                const wingMat = new THREE.MeshLambertMaterial({
                    color: 0xaaddff, transparent: true, opacity: 0.5, side: THREE.DoubleSide
                });
                const wing = new THREE.Mesh(wingGeo, wingMat);
                wing.position.set(0, side * 0.08, 0);
                wing.rotation.x = Math.PI / 2;
                group.add(wing);
            });
            group.position.set(
                POND_CENTER.x + (Math.random() - 0.5) * 4,
                0.8 + Math.random() * 0.5,
                POND_CENTER.z + (Math.random() - 0.5) * 3
            );
            group.userData = {
                phase: Math.random() * Math.PI * 2,
                speed: 0.8 + Math.random() * 0.5,
                hoverTimer: 0,
                isHovering: false
            };
            this.scene.add(group);
            this.dragonflies.push(group);
        }
    },

    // ===== 青蛙 =====
    _createFrog() {
        const group = new THREE.Group();
        // 身体
        const bodyGeo = new THREE.SphereGeometry(0.08, 8, 6);
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0x4A7C3F });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.scale.set(1, 0.7, 1.1);
        group.add(body);
        // 眼睛（凸出）
        [-0.05, 0.05].forEach(ex => {
            const eyeGeo = new THREE.SphereGeometry(0.025, 6, 6);
            const eyeMat = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
            const eye = new THREE.Mesh(eyeGeo, eyeMat);
            eye.position.set(ex, 0.07, 0.04);
            group.add(eye);
            const pupilGeo = new THREE.SphereGeometry(0.012, 5, 5);
            const pupilMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
            const pupil = new THREE.Mesh(pupilGeo, pupilMat);
            pupil.position.set(ex, 0.07, 0.06);
            group.add(pupil);
        });
        // 放在岸边石头上
        group.position.set(POND_CENTER.x + POND_RADIUS_X + 0.3, 0.08, POND_CENTER.z - 0.5);
        group.userData = { isVisible: true, jumpTimer: 15 + Math.random() * 20 };
        this.scene.add(group);
        this.frog = group;
    },

    // ===== 涟漪系统 =====
    createRipple(x, z) {
        if (this.ripples.length >= 5) {
            // 移除最老的涟漪
            const old = this.ripples.shift();
            this.scene.remove(old.mesh);
            old.mesh.geometry.dispose();
        }
        const geo = new THREE.RingGeometry(0.08, 0.18, 32);
        const mat = new THREE.MeshBasicMaterial({
            color: 0xaaddff, transparent: true, opacity: 0.8, side: THREE.DoubleSide
        });
        const ring = new THREE.Mesh(geo, mat);
        ring.rotation.x = -Math.PI / 2;
        ring.position.set(x, 0.02, z);
        this.scene.add(ring);
        this.ripples.push({ mesh: ring, age: 0, maxAge: 2.0 });

    },

    // ===== 鸭子划水尾波 =====
    createDuckWake(x, z, angle) {
        // V字形尾波：两条线从鸭子身后向两侧扩散
        const wakeGroup = new THREE.Group();
        wakeGroup.position.set(x, 0.015, z);
        wakeGroup.rotation.y = angle;

        [-1, 1].forEach(side => {
            const pts = [];
            for (let i = 0; i < 8; i++) {
                pts.push(new THREE.Vector3(
                    side * i * 0.12,
                    0,
                    -i * 0.18
                ));
            }
            const geo = new THREE.BufferGeometry().setFromPoints(pts);
            const mat = new THREE.LineBasicMaterial({
                color: 0xaaddff, transparent: true, opacity: 0.5
            });
            wakeGroup.add(new THREE.Line(geo, mat));
        });

        this.scene.add(wakeGroup);
        this.duckWakes.push({ mesh: wakeGroup, age: 0, maxAge: 1.2 });

        // 限制最多5个尾波
        if (this.duckWakes.length > 5) {
            const old = this.duckWakes.shift();
            this.scene.remove(old.mesh);
        }
    },

    // ===== 判断坐标是否在池塘内（含缓冲区） =====
    // 使用椭圆近似做快速碰撞检测，再用射线法精确判断不规则形状
    isInPond(x, z, buffer = 0) {
        // 先用椭圆快速排除
        const dx = (x - POND_CENTER.x) / (POND_RADIUS_X + buffer + 0.5);
        const dz = (z - POND_CENTER.z) / (POND_RADIUS_Z + buffer + 0.5);
        if (dx * dx + dz * dz > 1.0) return false;
        // 再用射线法精确判断不规则多边形
        const lx = x - POND_CENTER.x;
        const lz = z - POND_CENTER.z;
        const scale = 1.0 + buffer / Math.max(POND_RADIUS_X, POND_RADIUS_Z);
        const pts = POND_SHAPE_POINTS;
        let inside = false;
        for (let i = 0, j = pts.length - 2; i < pts.length - 1; j = i++) {
            const xi = pts[i][0] * scale, zi = pts[i][1] * scale;
            const xj = pts[j][0] * scale, zj = pts[j][1] * scale;
            const intersect = ((zi > lz) !== (zj > lz)) &&
                (lx < (xj - xi) * (lz - zi) / (zj - zi) + xi);
            if (intersect) inside = !inside;
        }
        return inside;
    },


    // ===== 在池塘内生成随机目标点 =====
    randomPointInPond() {
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.random() * 0.85;
            const x = POND_CENTER.x + Math.cos(angle) * POND_RADIUS_X * r;
            const z = POND_CENTER.z + Math.sin(angle) * POND_RADIUS_Z * r;
            if (this.isInPond(x, z)) return { x, z };
        }
        return { x: POND_CENTER.x, z: POND_CENTER.z };
    },

    // ===== 每帧更新 =====
    update(deltaTime) {
        const t = performance.now() * 0.001;

        // 水面轻微波动（透明度）
        if (this.pondMesh) {
            this.pondMesh.material.opacity = 0.68 + Math.sin(t * 0.8) * 0.04;
        }

        // 芦苇随风摆动
        this.reedGroups.forEach(group => {
            group.children.forEach(child => {
                if (child.userData.swayPhase !== undefined) {
                    child.rotation.z = child.userData.baseRotZ +
                        Math.sin(t * 1.2 + child.userData.swayPhase) * 0.06;
                }
            });
        });

        // 涟漪扩散
        for (let i = this.ripples.length - 1; i >= 0; i--) {
            const r = this.ripples[i];
            r.age += deltaTime;
            const progress = r.age / r.maxAge;
            const scale = 1 + progress * 5; // 扩散到最大半径约1单位，自然涟漪效果

            r.mesh.scale.set(scale, scale, scale);
            r.mesh.material.opacity = 0.7 * (1 - progress);
            if (r.age >= r.maxAge) {
                this.scene.remove(r.mesh);
                r.mesh.geometry.dispose();
                this.ripples.splice(i, 1);
            }
        }

        // 鸭子尾波消退
        for (let i = this.duckWakes.length - 1; i >= 0; i--) {
            const w = this.duckWakes[i];
            w.age += deltaTime;
            const opacity = 0.5 * (1 - w.age / w.maxAge);
            w.mesh.children.forEach(c => { if (c.material) c.material.opacity = opacity; });
            if (w.age >= w.maxAge) {
                this.scene.remove(w.mesh);
                this.duckWakes.splice(i, 1);
            }
        }

        // 鱼影游动
        this.fishShadows.forEach(shadow => {
            const ud = shadow.userData;
            ud.dartTimer -= deltaTime;
            if (ud.dartTimer <= 0) {
                ud.isDarting = !ud.isDarting;
                ud.dartTimer = ud.isDarting ? 0.3 + Math.random() * 0.5 : 4 + Math.random() * 8;
                ud.dartDir = Math.random() * Math.PI * 2;
            }
            const speed = ud.isDarting ? 2.5 : ud.speed;
            if (ud.isDarting) {
                shadow.position.x += Math.cos(ud.dartDir) * speed * deltaTime;
                shadow.position.z += Math.sin(ud.dartDir) * speed * deltaTime;
            } else {
                ud.angle += speed * deltaTime * 0.3;
                shadow.position.x = POND_CENTER.x + Math.cos(ud.angle) * POND_RADIUS_X * ud.radius;
                shadow.position.z = POND_CENTER.z + Math.sin(ud.angle) * POND_RADIUS_Z * ud.radius;
            }
            // 确保不游出池塘
            if (!this.isInPond(shadow.position.x, shadow.position.z)) {
                shadow.position.x = POND_CENTER.x;
                shadow.position.z = POND_CENTER.z;
                ud.angle = Math.random() * Math.PI * 2;
            }
            // 透明度随机闪烁
            shadow.material.opacity = 0.25 + Math.sin(t * 2 + ud.phase) * 0.1;
        });

        // 蜻蜓飞行
        this.dragonflies.forEach(df => {
            const ud = df.userData;
            ud.phase += deltaTime * ud.speed;
            if (ud.isHovering) {
                ud.hoverTimer -= deltaTime;
                // 悬停时轻微抖动
                df.position.y = 0.9 + Math.sin(ud.phase * 8) * 0.03;
                if (ud.hoverTimer <= 0) ud.isHovering = false;
            } else {
                // 绕池塘飞行
                df.position.x = POND_CENTER.x + Math.cos(ud.phase * 0.4) * (POND_RADIUS_X + 0.5);
                df.position.z = POND_CENTER.z + Math.sin(ud.phase * 0.6) * (POND_RADIUS_Z + 0.5);
                df.position.y = 0.7 + Math.sin(ud.phase * 3) * 0.2;
                df.rotation.y = Math.atan2(
                    Math.cos(ud.phase * 0.6) * 0.6,
                    -Math.sin(ud.phase * 0.4) * 0.4
                );
                // 翅膀扇动
                df.children.forEach((c, i) => {
                    if (i > 0) c.rotation.z = Math.sin(ud.phase * 20) * 0.3;
                });
                // 偶尔悬停
                if (Math.random() < 0.002) {
                    ud.isHovering = true;
                    ud.hoverTimer = 1 + Math.random() * 2;
                }
            }
        });

        // 青蛙跳跃
        if (this.frog) {
            const ud = this.frog.userData;
            ud.jumpTimer -= deltaTime;
            if (ud.jumpTimer <= 0 && ud.isVisible) {
                // 跳入水中
                ud.isVisible = false;
                this.frog.visible = false;
                this.createRipple(
                    POND_CENTER.x + POND_RADIUS_X * 0.8,
                    POND_CENTER.z - 0.5
                );
                // 10-20秒后重新出现
                ud.jumpTimer = 10 + Math.random() * 20;
            } else if (ud.jumpTimer <= 0 && !ud.isVisible) {
                ud.isVisible = true;
                this.frog.visible = true;
                ud.jumpTimer = 15 + Math.random() * 25;
            }
        }

        // 钓鱼点标签始终朝向相机
        if (typeof Scene3D !== 'undefined' && Scene3D.camera) {
            this.fishingSpotMeshes.forEach(spot => {
                const label = spot.children.find(c => c instanceof THREE.Sprite);
                if (label) {
                    // Sprite自动朝向相机，无需额外处理
                }
            });
        }
    },

    // ===== 点击检测（钓鱼点） =====
    checkFishingSpotClick(raycaster) {
        // 递归检测所有子mesh（码头平台很薄，需要递归才能命中）
        const hits = raycaster.intersectObjects(this.fishingSpotMeshes, true);
        if (hits.length > 0) {
            // 向上找到 fishingSpotMeshes 中的顶层 Group
            let obj = hits[0].object;
            while (obj.parent && !this.fishingSpotMeshes.includes(obj)) {
                obj = obj.parent;
            }
            if (obj.userData && obj.userData.type === 'fishingSpot') {
                if (typeof FishingSystem !== 'undefined') {
                    // 先打开钓鱼UI弹窗，再开始钓鱼
                    FishingSystem.showFishingUI();
                    // 如果当前是空闲状态，自动开始钓鱼
                    if (FishingSystem.state === FISHING_STATE.IDLE) {
                        FishingSystem.startFishing();
                    }
                }
                return true;
            }
        }
        return false;
    }


};
