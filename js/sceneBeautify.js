// ===== 3D农场场景美化模块 =====
// 草地纹理层次、地面装饰、路径系统、围栏美化、土地纹理、氛围粒子、农场道具

const SceneBeautify = {

    // ===== 1. 创建多层次草地地面 =====
    createRichTerrain(scene) {
        // 基础草地（主色调 #4A7C23）
        const groundGeo = new THREE.PlaneGeometry(60, 60, 30, 30);
        // 顶点颜色扰动，模拟草地深浅变化
        const posAttr = groundGeo.attributes.position;
        const colors = [];
        const baseColors = [
            new THREE.Color(0x4A7C23), // 基础草色 70%
            new THREE.Color(0x2D5016), // 深色草丛 15%
            new THREE.Color(0x7CB342), // 浅色亮点 10%
            new THREE.Color(0xA68B5B), // 枯黄点缀 5%
        ];
        for (let i = 0; i < posAttr.count; i++) {
            const r = Math.random();
            let c;
            if (r < 0.70) c = baseColors[0];
            else if (r < 0.85) c = baseColors[1];
            else if (r < 0.95) c = baseColors[2];
            else c = baseColors[3];
            // 轻微随机扰动
            const jitter = (Math.random() - 0.5) * 0.06;
            colors.push(c.r + jitter, c.g + jitter, c.b + jitter);
        }
        groundGeo.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
        const groundMat = new THREE.MeshLambertMaterial({ vertexColors: true });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        scene.add(ground);

        // 草地踩踏痕（随机分布浅色椭圆斑块）
        for (let i = 0; i < 12; i++) {
            const x = (Math.random() - 0.5) * 22;
            const z = (Math.random() - 0.5) * 22;
            const w = 0.3 + Math.random() * 0.5;
            const d = 0.2 + Math.random() * 0.3;
            const trampleGeo = new THREE.PlaneGeometry(w, d);
            const trampleMat = new THREE.MeshLambertMaterial({ color: 0x5D8A32, transparent: true, opacity: 0.6 });
            const trample = new THREE.Mesh(trampleGeo, trampleMat);
            trample.rotation.x = -Math.PI / 2;
            trample.rotation.z = Math.random() * Math.PI;
            trample.position.set(x, 0.005, z);
            scene.add(trample);
        }
    },

    // ===== 2. 创建路径系统 =====
    createPaths(scene) {
        // 主泥土路（纵向，连接房屋↔农田↔风车）
        const mainPathMat = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
        const mainPathGeo = new THREE.PlaneGeometry(1.2, 26);
        const mainPath = new THREE.Mesh(mainPathGeo, mainPathMat);
        mainPath.rotation.x = -Math.PI / 2;
        mainPath.position.set(0, 0.008, 0);
        scene.add(mainPath);

        // 横向主路
        const crossPathGeo = new THREE.PlaneGeometry(26, 1.2);
        const crossPath = new THREE.Mesh(crossPathGeo, mainPathMat);
        crossPath.rotation.x = -Math.PI / 2;
        crossPath.position.set(0, 0.008, 0);
        scene.add(crossPath);

        // 路径边缘磨损纹理（两侧深色条）
        const edgeMat = new THREE.MeshLambertMaterial({ color: 0x6B5A3E, transparent: true, opacity: 0.5 });
        [-0.65, 0.65].forEach(offset => {
            const edgeGeo = new THREE.PlaneGeometry(0.15, 26);
            const edge = new THREE.Mesh(edgeGeo, edgeMat);
            edge.rotation.x = -Math.PI / 2;
            edge.position.set(offset, 0.009, 0);
            scene.add(edge);
        });
        [-0.65, 0.65].forEach(offset => {
            const edgeGeo = new THREE.PlaneGeometry(26, 0.15);
            const edge = new THREE.Mesh(edgeGeo, edgeMat);
            edge.rotation.x = -Math.PI / 2;
            edge.position.set(0, 0.009, offset);
            scene.add(edge);
        });

        // 石子小径（农田↔动物区，斜向）
        const stonePathMat = new THREE.MeshLambertMaterial({ color: 0x9E9E9E, transparent: true, opacity: 0.8 });
        const stonePath1Geo = new THREE.PlaneGeometry(0.7, 10);
        const stonePath1 = new THREE.Mesh(stonePath1Geo, stonePathMat);
        stonePath1.rotation.x = -Math.PI / 2;
        stonePath1.rotation.z = 0.3;
        stonePath1.position.set(7, 0.009, 3);
        scene.add(stonePath1);

        // 路面石子颗粒
        const pebbleMat = new THREE.MeshLambertMaterial({ color: 0xAAAAAA });
        for (let i = 0; i < 30; i++) {
            const px = (Math.random() - 0.5) * 1.0;
            const pz = (Math.random() - 0.5) * 25;
            const pGeo = new THREE.SphereGeometry(0.04 + Math.random() * 0.04, 4, 3);
            const pebble = new THREE.Mesh(pGeo, pebbleMat);
            pebble.position.set(px, 0.02, pz);
            pebble.rotation.set(Math.random(), Math.random(), Math.random());
            scene.add(pebble);
        }
    },

    // ===== 3. 创建美化围栏 =====
    createBeautifulFence(scene) {
        const postColors = [0x8B4513, 0x7A3B10, 0x9A5020, 0xA0522D];
        const railColors = [0x8B4513, 0xA0522D];

        const fenceRadius = 12;
        const spacing = 2.0;

        // 四边围栏
        const sides = [
            { axis: 'x', fixed: -fenceRadius, dir: 'z' },
            { axis: 'x', fixed: fenceRadius, dir: 'z' },
            { axis: 'z', fixed: -fenceRadius, dir: 'x' },
            { axis: 'z', fixed: fenceRadius, dir: 'x' },
        ];

        sides.forEach(side => {
            let postIndex = 0;
            for (let t = -fenceRadius; t <= fenceRadius; t += spacing) {
                postIndex++;

                const px = side.axis === 'x' ? t : side.fixed;
                const pz = side.axis === 'z' ? t : side.fixed;

                // 跳过落在湖泊区域内的桩位（含1.5缓冲）
                if (this._isInPondArea(px, pz, 1.5)) continue;

                // 随机粗细变化 ±15%

                const thickMult = 0.85 + Math.random() * 0.3;
                const w = 0.18 * thickMult;

                // 偶尔破损木桩（倾斜5-15度）
                const isBroken = (postIndex % 9 === 0);
                const postH = isBroken ? (0.3 + Math.random() * 0.05) : (0.45 + Math.random() * 0.05);
                const tiltAngle = isBroken ? (0.08 + Math.random() * 0.17) : 0;

                const postGeo = new THREE.BoxGeometry(w, postH, w);
                const postMat = new THREE.MeshLambertMaterial({
                    color: postColors[Math.floor(Math.random() * postColors.length)]
                });
                const post = new THREE.Mesh(postGeo, postMat);

                post.position.set(px, postH / 2, pz);

                if (isBroken) post.rotation.z = tiltAngle * (Math.random() > 0.5 ? 1 : -1);
                post.castShadow = true;
                scene.add(post);

                // 转角加粗支柱
                if (Math.abs(t) === fenceRadius) {
                    const cornerGeo = new THREE.BoxGeometry(0.3, 0.6, 0.3);
                    const corner = new THREE.Mesh(cornerGeo, new THREE.MeshLambertMaterial({ color: 0x6B3410 }));
                    corner.position.set(px, 0.3, pz);
                    corner.castShadow = true;
                    scene.add(corner);
                }

                // 横木条（两根，高低各一）—— 跳过下一段也在湖泊内的情况
                if (t < fenceRadius) {
                    const nextT = t + spacing;
                    const npx = side.axis === 'x' ? nextT : side.fixed;
                    const npz = side.axis === 'z' ? nextT : side.fixed;
                    // 如果当前桩或下一桩在湖泊内，跳过横木
                    if (this._isInPondArea(npx, npz, 1.5)) continue;

                    const railLen = spacing;
                    const railMat = new THREE.MeshLambertMaterial({
                        color: railColors[Math.floor(Math.random() * railColors.length)]
                    });
                    [0.35, 0.15].forEach(railY => {
                        let railGeo;
                        if (side.dir === 'z') {
                            railGeo = new THREE.BoxGeometry(0.08, 0.06, railLen);
                        } else {
                            railGeo = new THREE.BoxGeometry(railLen, 0.06, 0.08);
                        }
                        const rail = new THREE.Mesh(railGeo, railMat);
                        const rx = side.axis === 'x' ? (t + spacing / 2) : side.fixed;
                        const rz = side.axis === 'z' ? (t + spacing / 2) : side.fixed;
                        rail.position.set(rx, railY, rz);
                        scene.add(rail);
                    });
                }
            }
        });
    },

    // ===== 4. 创建美化土地地块 =====
    createBeautifulPlot(group, plotIndex) {
        // 基础土色 #795548
        const soilMat = new THREE.MeshLambertMaterial({ color: 0x795548 });
        const soilGeo = new THREE.BoxGeometry(3.0, 0.28, 3.0);

        const soil = new THREE.Mesh(soilGeo, soilMat);
        soil.position.y = 0.14;
        soil.receiveShadow = true;
        soil.castShadow = true;
        group.add(soil);
        group.userData.soilMesh = soil;
        group.userData.soilBaseMat = soilMat;

        // 耕作沟痕（平行横纹，间距0.1）
        const furrowMat = new THREE.MeshLambertMaterial({ color: 0x5D4037 });
        for (let row = -1.5; row <= 1.5; row += 0.35) {
            const furrowGeo = new THREE.BoxGeometry(3.3, 0.03, 0.06);
            const furrow = new THREE.Mesh(furrowGeo, furrowMat);
            furrow.position.set(0, 0.295, row);
            group.add(furrow);
        }

        // 土块颗粒（随机凸起）
        const clodMat = new THREE.MeshLambertMaterial({ color: 0x6D4C41 });
        for (let c = 0; c < 18; c++) {
            const cx = (Math.random() - 0.5) * 3.0;
            const cz = (Math.random() - 0.5) * 3.0;
            const cs = 0.04 + Math.random() * 0.07;
            const clodGeo = new THREE.SphereGeometry(cs, 4, 3);
            const clod = new THREE.Mesh(clodGeo, clodMat);
            clod.position.set(cx, 0.29 + cs * 0.5, cz);
            clod.rotation.set(Math.random(), Math.random(), Math.random());
            group.add(clod);
        }

        // 边缘过渡：杂草点缀
        const weedMat = new THREE.MeshLambertMaterial({ color: 0x5D8A32 });
        for (let w = 0; w < 8; w++) {
            const angle = (w / 8) * Math.PI * 2;
            const r = 1.7 + Math.random() * 0.1;
            const wx = Math.cos(angle) * r;
            const wz = Math.sin(angle) * r;
            const wh = 0.04 + Math.random() * 0.05;
            const weedGeo = new THREE.CylinderGeometry(0.01, 0.02, wh, 3);
            const weed = new THREE.Mesh(weedGeo, weedMat);
            weed.position.set(wx, 0.29 + wh / 2, wz);
            weed.rotation.z = (Math.random() - 0.5) * 0.4;
            group.add(weed);
        }

        // 边框（碎土散落感）
        const borderMat = new THREE.MeshLambertMaterial({ color: 0x4E342E });
        const borderGeo = new THREE.BoxGeometry(3.8, 0.08, 3.8);
        const border = new THREE.Mesh(borderGeo, borderMat);
        border.position.y = 0.04;
        group.add(border);
    },

    // 更新土地湿润状态
    updatePlotWater(group, watered) {
        const soil = group.userData.soilMesh;
        if (!soil) return;
        if (watered) {
            soil.material.color.setHex(0x3E2723); // 深色湿润
        } else {
            soil.material.color.setHex(0x795548); // 恢复干燥
        }
    },

    // 检查坐标是否在池塘区域内（含缓冲）
    _isInPondArea(x, z, buffer = 1.0) {
        // 使用射线法判断不规则湖泊多边形（与pond.js的POND_SHAPE_POINTS保持一致）
        const POND_CENTER_X = -14, POND_CENTER_Z = 11;
        const POND_SHAPE = [
            [ 4.5,  0.5], [ 3.8,  2.5], [ 1.5,  4.0], [-1.0,  3.8],
            [-3.5,  2.8], [-5.0,  0.8], [-4.8, -1.5], [-3.0, -3.5],
            [-0.5, -4.2], [ 2.0, -3.8], [ 4.0, -2.0], [ 4.5,  0.5]
        ];
        const lx = x - POND_CENTER_X;
        const lz = z - POND_CENTER_Z;
        // 先用椭圆快速排除
        const scale = 1.0 + buffer / 5.0;
        const dx = lx / (5.0 * scale + buffer);
        const dz = lz / (4.0 * scale + buffer);
        if (dx * dx + dz * dz > 1.0) return false;
        // 射线法精确判断
        const pts = POND_SHAPE;
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


    // ===== 5. 地面装饰物 =====
    createGroundDecorations(scene) {
        // 野花草丛（20-30簇）
        for (let i = 0; i < 25; i++) {
            const x = this._randPos();
            const z = this._randPos();
            if (Math.abs(x) < 7 && Math.abs(z) < 7) continue; // 避开农田区
            if (this._isInPondArea(x, z)) continue; // 避开池塘区
            this._createFlowerCluster(scene, x, z);
        }

        // 小石子（15-25个）
        for (let i = 0; i < 20; i++) {
            const x = this._randPos();
            const z = this._randPos();
            if (this._isInPondArea(x, z)) continue; // 避开池塘区
            this._createPebble(scene, x, z);
        }


        // 灌木丛（8-12个，边界处）
        const bushPositions = [
            [-11, -6], [-11, 0], [-11, 6], [11, -6], [11, 0], [11, 6],
            [-6, -11], [0, -11], [6, -11], [-6, 11], [0, 11], [6, 11]
        ];
        bushPositions.forEach(([x, z]) => this._createBush(scene, x, z));

        // 蘑荇（5-8个，树下阴凉处）—— 避开池塘区域，[-7,9]和[7,9]落在池塘内，改为安全位置
        const mushroomPos = [[-10, 4], [-10, -3], [10, 4], [10, -3], [-3, 10], [7, -9]];
        mushroomPos.forEach(([x, z]) => this._createMushroom(scene, x, z));

        // 落叶堆（3-5处，树木周围）—— 避开池塘区域，[-7,10]落在池塘内，改为安全位置
        const leafPos = [[-10, 5], [10, 5], [-3, 10], [7, -10]];
        leafPos.forEach(([x, z]) => this._createLeafPile(scene, x, z));
    },

    _randPos() {
        return (Math.random() - 0.5) * 22;
    },

    _createFlowerCluster(scene, x, z) {
        const flowerColors = [0xFF6B9D, 0xFFD700, 0xFF4444, 0xAA44FF, 0xFF8C00, 0xFFFFFF];
        const count = 2 + Math.floor(Math.random() * 4);
        for (let i = 0; i < count; i++) {
            const color = flowerColors[Math.floor(Math.random() * flowerColors.length)];
            const stemH = 0.1 + Math.random() * 0.2;
            // 茎
            const stemGeo = new THREE.CylinderGeometry(0.01, 0.015, stemH, 4);
            const stemMat = new THREE.MeshLambertMaterial({ color: 0x3CB371 });
            const stem = new THREE.Mesh(stemGeo, stemMat);
            const ox = (Math.random() - 0.5) * 0.3;
            const oz = (Math.random() - 0.5) * 0.3;
            stem.position.set(x + ox, stemH / 2, z + oz);
            scene.add(stem);
            // 花朵
            const petalGeo = new THREE.SphereGeometry(0.05 + Math.random() * 0.04, 5, 4);
            const petalMat = new THREE.MeshLambertMaterial({ color });
            const petal = new THREE.Mesh(petalGeo, petalMat);
            petal.scale.y = 0.5;
            petal.position.set(x + ox, stemH + 0.04, z + oz);
            scene.add(petal);
        }
    },

    _createPebble(scene, x, z) {
        const pebbleColors = [0x9E9E9E, 0x8D8D8D, 0xBDBDBD, 0x757575];
        const color = pebbleColors[Math.floor(Math.random() * pebbleColors.length)];
        const size = 0.05 + Math.random() * 0.1;
        const geo = new THREE.SphereGeometry(size, 5, 4);
        const mat = new THREE.MeshLambertMaterial({ color });
        const pebble = new THREE.Mesh(geo, mat);
        pebble.scale.set(1 + Math.random() * 0.5, 0.5 + Math.random() * 0.3, 1 + Math.random() * 0.5);
        pebble.position.set(x, size * 0.3, z);
        pebble.rotation.y = Math.random() * Math.PI;
        scene.add(pebble);
    },

    _createBush(scene, x, z) {
        const bushColors = [0x2E7D32, 0x388E3C, 0x1B5E20, 0x33691E];
        const color = bushColors[Math.floor(Math.random() * bushColors.length)];
        const size = 0.3 + Math.random() * 0.3;
        // 主球
        const mainGeo = new THREE.SphereGeometry(size, 7, 6);
        const mat = new THREE.MeshLambertMaterial({ color });
        const main = new THREE.Mesh(mainGeo, mat);
        main.position.set(x, size * 0.7, z);
        main.castShadow = true;
        scene.add(main);
        // 侧球
        for (let i = 0; i < 2; i++) {
            const sSize = size * (0.6 + Math.random() * 0.3);
            const sGeo = new THREE.SphereGeometry(sSize, 6, 5);
            const side = new THREE.Mesh(sGeo, mat);
            side.position.set(x + (i === 0 ? -size * 0.7 : size * 0.7), sSize * 0.6, z + (Math.random() - 0.5) * size);
            side.castShadow = true;
            scene.add(side);
        }
    },

    _createMushroom(scene, x, z) {
        const stemMat = new THREE.MeshLambertMaterial({ color: 0xF5F5DC });
        const capMat = new THREE.MeshLambertMaterial({ color: 0xCC2200 });
        const dotMat = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const stemH = 0.08 + Math.random() * 0.07;
        const capR = 0.06 + Math.random() * 0.06;
        // 茎
        const stemGeo = new THREE.CylinderGeometry(0.02, 0.03, stemH, 6);
        const stem = new THREE.Mesh(stemGeo, stemMat);
        stem.position.set(x, stemH / 2, z);
        scene.add(stem);
        // 伞盖
        const capGeo = new THREE.SphereGeometry(capR, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2);
        const cap = new THREE.Mesh(capGeo, capMat);
        cap.position.set(x, stemH, z);
        scene.add(cap);
        // 白点
        for (let d = 0; d < 3; d++) {
            const da = (d / 3) * Math.PI * 2;
            const dotGeo = new THREE.SphereGeometry(0.01, 4, 3);
            const dot = new THREE.Mesh(dotGeo, dotMat);
            dot.position.set(x + Math.cos(da) * capR * 0.5, stemH + capR * 0.3, z + Math.sin(da) * capR * 0.5);
            scene.add(dot);
        }
    },

    _createLeafPile(scene, x, z) {
        const leafColors = [0xD4A017, 0xC8860A, 0xB8650A, 0xA0522D];
        for (let i = 0; i < 8; i++) {
            const color = leafColors[Math.floor(Math.random() * leafColors.length)];
            const lx = x + (Math.random() - 0.5) * 0.8;
            const lz = z + (Math.random() - 0.5) * 0.8;
            const lGeo = new THREE.SphereGeometry(0.08 + Math.random() * 0.08, 5, 3);
            const lMat = new THREE.MeshLambertMaterial({ color });
            const leaf = new THREE.Mesh(lGeo, lMat);
            leaf.scale.set(1.5 + Math.random(), 0.2, 1.5 + Math.random());
            leaf.position.set(lx, 0.02, lz);
            leaf.rotation.y = Math.random() * Math.PI;
            scene.add(leaf);
        }
    },

    // ===== 6. 农场道具 =====
    createFarmProps(scene) {
        // 水井（房屋侧方）
        this._createWell(scene, 8, 8);

        // 干草垛（动物区旁，2-3垛）—— 移至池塘右侧安全区域
        this._createHayBale(scene, -5, 4);
        this._createHayBale(scene, -5.8, 4.5);
        this._createHayBale(scene, -5, 5.2);


        // 木桶（房屋门口，3-5个）
        [-9.5, -8.8, -8.2, -9.2].forEach((bx, i) => {
            this._createBarrel(scene, bx, -8 + i * 0.3);
        });

        // 稻草人（农田中央）
        this._createScarecrow(scene, 0, -8);

        // 工具架（房屋墙边）
        this._createToolRack(scene, -10.5, -7);

        // 长椅（树荫下）
        this._createBench(scene, -9, 3);
        this._createBench(scene, 9, 3);
    },

    _createWell(scene, x, z) {
        const stoneMat = new THREE.MeshLambertMaterial({ color: 0x9E9E9E });
        const woodMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const roofMat = new THREE.MeshLambertMaterial({ color: 0x8B0000 });

        // 井圈
        const wellGeo = new THREE.CylinderGeometry(0.35, 0.38, 0.5, 12, 1, true);
        const well = new THREE.Mesh(wellGeo, stoneMat);
        well.position.set(x, 0.25, z);
        well.castShadow = true;
        scene.add(well);
        // 井底
        const baseGeo = new THREE.CylinderGeometry(0.38, 0.4, 0.08, 12);
        const base = new THREE.Mesh(baseGeo, stoneMat);
        base.position.set(x, 0.04, z);
        scene.add(base);
        // 支架
        [-0.3, 0.3].forEach(ox => {
            const postGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.9, 5);
            const post = new THREE.Mesh(postGeo, woodMat);
            post.position.set(x + ox, 0.7, z);
            post.castShadow = true;
            scene.add(post);
        });
        // 横梁
        const beamGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.7, 5);
        const beam = new THREE.Mesh(beamGeo, woodMat);
        beam.rotation.z = Math.PI / 2;
        beam.position.set(x, 1.1, z);
        scene.add(beam);
        // 摇把
        const handleGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.25, 4);
        const handle = new THREE.Mesh(handleGeo, woodMat);
        handle.rotation.x = Math.PI / 2;
        handle.position.set(x + 0.2, 1.1, z + 0.15);
        scene.add(handle);
        // 小屋顶
        const roofGeo = new THREE.ConeGeometry(0.55, 0.4, 4);
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.rotation.y = Math.PI / 4;
        roof.position.set(x, 1.4, z);
        roof.castShadow = true;
        scene.add(roof);
    },

    _createHayBale(scene, x, z) {
        const hayMat = new THREE.MeshLambertMaterial({ color: 0xDAA520 });
        const bandMat = new THREE.MeshLambertMaterial({ color: 0xB8860B });
        // 主体（圆柱形草垛）
        const baleGeo = new THREE.CylinderGeometry(0.45, 0.45, 0.7, 10);
        const bale = new THREE.Mesh(baleGeo, hayMat);
        bale.rotation.z = Math.PI / 2;
        bale.position.set(x, 0.45, z);
        bale.castShadow = true;
        scene.add(bale);
        // 捆绑带
        [-0.15, 0.15].forEach(oy => {
            const bandGeo = new THREE.TorusGeometry(0.45, 0.03, 4, 12);
            const band = new THREE.Mesh(bandGeo, bandMat);
            band.rotation.x = Math.PI / 2;
            band.position.set(x + oy, 0.45, z);
            scene.add(band);
        });
    },

    _createBarrel(scene, x, z) {
        const woodMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const bandMat = new THREE.MeshLambertMaterial({ color: 0x5C3317 });
        const h = 0.35 + Math.random() * 0.1;
        const r = 0.12 + Math.random() * 0.03;
        // 桶身
        const barrelGeo = new THREE.CylinderGeometry(r, r * 0.9, h, 8);
        const barrel = new THREE.Mesh(barrelGeo, woodMat);
        barrel.position.set(x, h / 2, z);
        barrel.rotation.y = Math.random() * Math.PI;
        barrel.castShadow = true;
        scene.add(barrel);
        // 铁箍
        [0.3, 0.7].forEach(t => {
            const bandGeo = new THREE.TorusGeometry(r * 1.02, 0.015, 4, 10);
            const band = new THREE.Mesh(bandGeo, bandMat);
            band.rotation.x = Math.PI / 2;
            band.position.set(x, h * t, z);
            scene.add(band);
        });
    },

    _createScarecrow(scene, x, z) {
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0x8B6914 });
        const hatMat = new THREE.MeshLambertMaterial({ color: 0x3E2723 });
        const faceMat = new THREE.MeshLambertMaterial({ color: 0xF5DEB3 });
        const clothMat = new THREE.MeshLambertMaterial({ color: 0x795548 });

        // 木桩
        const poleGeo = new THREE.CylinderGeometry(0.04, 0.05, 1.2, 5);
        const pole = new THREE.Mesh(poleGeo, bodyMat);
        pole.position.set(x, 0.6, z);
        pole.castShadow = true;
        scene.add(pole);
        // 横杆
        const crossGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.8, 4);
        const cross = new THREE.Mesh(crossGeo, bodyMat);
        cross.rotation.z = Math.PI / 2;
        cross.position.set(x, 0.9, z);
        scene.add(cross);
        // 头部
        const headGeo = new THREE.SphereGeometry(0.12, 7, 6);
        const head = new THREE.Mesh(headGeo, faceMat);
        head.position.set(x, 1.3, z);
        head.castShadow = true;
        scene.add(head);
        // 破旧帽子
        const brimGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.03, 8);
        const brim = new THREE.Mesh(brimGeo, hatMat);
        brim.position.set(x, 1.42, z);
        scene.add(brim);
        const crownGeo = new THREE.CylinderGeometry(0.1, 0.12, 0.18, 8);
        const crown = new THREE.Mesh(crownGeo, hatMat);
        crown.position.set(x, 1.52, z);
        crown.rotation.z = 0.15; // 歪戴
        scene.add(crown);
        // 衣服（身体）
        const bodyGeo = new THREE.BoxGeometry(0.35, 0.4, 0.15);
        const body = new THREE.Mesh(bodyGeo, clothMat);
        body.position.set(x, 0.85, z);
        scene.add(body);
    },

    _createToolRack(scene, x, z) {
        const woodMat = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const metalMat = new THREE.MeshLambertMaterial({ color: 0x9E9E9E });

        // 架子主体
        const frameGeo = new THREE.BoxGeometry(0.6, 0.8, 0.1);
        const frame = new THREE.Mesh(frameGeo, woodMat);
        frame.position.set(x, 0.4, z);
        frame.castShadow = true;
        scene.add(frame);

        // 锄头
        const hoeHandleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.7, 4);
        const hoeHandle = new THREE.Mesh(hoeHandleGeo, woodMat);
        hoeHandle.rotation.z = 0.2;
        hoeHandle.position.set(x - 0.15, 0.7, z + 0.1);
        scene.add(hoeHandle);
        const hoeHeadGeo = new THREE.BoxGeometry(0.15, 0.04, 0.06);
        const hoeHead = new THREE.Mesh(hoeHeadGeo, metalMat);
        hoeHead.position.set(x - 0.22, 1.05, z + 0.1);
        scene.add(hoeHead);

        // 铲子
        const shovelHandleGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.75, 4);
        const shovelHandle = new THREE.Mesh(shovelHandleGeo, woodMat);
        shovelHandle.rotation.z = -0.15;
        shovelHandle.position.set(x + 0.1, 0.7, z + 0.1);
        scene.add(shovelHandle);
        const shovelHeadGeo = new THREE.BoxGeometry(0.12, 0.18, 0.04);
        const shovelHead = new THREE.Mesh(shovelHeadGeo, metalMat);
        shovelHead.position.set(x + 0.12, 0.25, z + 0.1);
        scene.add(shovelHead);

        // 水壶
        const canBodyGeo = new THREE.CylinderGeometry(0.07, 0.06, 0.18, 8);
        const canBody = new THREE.Mesh(canBodyGeo, metalMat);
        canBody.position.set(x + 0.25, 0.12, z + 0.15);
        scene.add(canBody);
        const spoutGeo = new THREE.CylinderGeometry(0.015, 0.02, 0.15, 5);
        const spout = new THREE.Mesh(spoutGeo, metalMat);
        spout.rotation.z = -0.8;
        spout.position.set(x + 0.35, 0.18, z + 0.15);
        scene.add(spout);
    },

    _createBench(scene, x, z) {
        const woodMat = new THREE.MeshLambertMaterial({ color: 0x8B6914 });
        const legMat = new THREE.MeshLambertMaterial({ color: 0x6B4F10 });

        // 座板
        const seatGeo = new THREE.BoxGeometry(0.65, 0.06, 0.28);
        const seat = new THREE.Mesh(seatGeo, woodMat);
        seat.position.set(x, 0.32, z);
        seat.castShadow = true;
        scene.add(seat);

        // 靠背
        const backGeo = new THREE.BoxGeometry(0.65, 0.22, 0.05);
        const back = new THREE.Mesh(backGeo, woodMat);
        back.position.set(x, 0.52, z - 0.12);
        back.rotation.x = 0.1;
        scene.add(back);

        // 腿（4根，略显陈旧倾斜）
        [[-0.27, -0.1], [0.27, -0.1], [-0.27, 0.1], [0.27, 0.1]].forEach(([lx, lz], i) => {
            const legGeo = new THREE.BoxGeometry(0.05, 0.3, 0.05);
            const leg = new THREE.Mesh(legGeo, legMat);
            leg.position.set(x + lx, 0.15, z + lz);
            leg.rotation.z = (i % 2 === 0 ? 0.03 : -0.03); // 轻微倾斜
            scene.add(leg);
        });
    },

    // ===== 7. 氛围粒子系统 =====
    particles: [],

    createAtmosphereParticles(scene) {
        this.particles = [];

        // 蝴蝶（3-5只）
        for (let i = 0; i < 4; i++) {
            this._createButterfly(scene, i);
        }

        // 蜜蜂（2-4只）
        for (let i = 0; i < 3; i++) {
            this._createBee(scene, i);
        }

        // 飘落花瓣（10-15片）
        for (let i = 0; i < 12; i++) {
            this._createPetal(scene, i);
        }
    },

    _createButterfly(scene, index) {
        const colors = [0xFF69B4, 0xFFD700, 0xFF6B35, 0x9B59B6];
        const color = colors[index % colors.length];
        const group = new THREE.Group();

        // 翅膀（两片）
        const wingMat = new THREE.MeshLambertMaterial({ color, transparent: true, opacity: 0.85, side: THREE.DoubleSide });
        [-1, 1].forEach(side => {
            const wingGeo = new THREE.SphereGeometry(0.1, 5, 4);
            const wing = new THREE.Mesh(wingGeo, wingMat);
            wing.scale.set(1.2, 0.15, 1.8);
            wing.position.x = side * 0.1;
            group.add(wing);
        });

        // 身体
        const bodyGeo = new THREE.CylinderGeometry(0.02, 0.015, 0.15, 4);
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.rotation.x = Math.PI / 2;
        group.add(body);

        // 随机初始位置（花丛上方）
        const startX = (Math.random() - 0.5) * 20;
        const startZ = (Math.random() - 0.5) * 20;
        group.position.set(startX, 0.5 + Math.random() * 0.8, startZ);

        scene.add(group);
        this.particles.push({
            type: 'butterfly',
            mesh: group,
            phase: Math.random() * Math.PI * 2,
            speed: 0.4 + Math.random() * 0.3,
            radius: 2 + Math.random() * 3,
            centerX: startX,
            centerZ: startZ,
            height: 0.5 + Math.random() * 0.8,
            wingPhase: Math.random() * Math.PI * 2,
            wings: [group.children[0], group.children[1]]
        });
    },

    _createBee(scene, index) {
        const group = new THREE.Group();

        // 蜂身（黄黑条纹）
        const bodyGeo = new THREE.SphereGeometry(0.06, 6, 5);
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0xFFCC00 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.scale.set(0.7, 0.7, 1.2);
        group.add(body);

        // 条纹
        for (let s = 0; s < 2; s++) {
            const stripeGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.02, 6);
            const stripeMat = new THREE.MeshLambertMaterial({ color: 0x333333 });
            const stripe = new THREE.Mesh(stripeGeo, stripeMat);
            stripe.rotation.x = Math.PI / 2;
            stripe.position.z = -0.02 + s * 0.04;
            group.add(stripe);
        }

        // 翅膀
        const wingMat = new THREE.MeshLambertMaterial({ color: 0xCCEEFF, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
        [-1, 1].forEach(side => {
            const wingGeo = new THREE.SphereGeometry(0.07, 5, 4);
            const wing = new THREE.Mesh(wingGeo, wingMat);
            wing.scale.set(1.0, 0.1, 1.5);
            wing.position.set(side * 0.07, 0.04, 0);
            group.add(wing);
        });

        const startX = (Math.random() - 0.5) * 16;
        const startZ = (Math.random() - 0.5) * 16;
        group.position.set(startX, 0.8 + Math.random() * 0.5, startZ);

        scene.add(group);
        this.particles.push({
            type: 'bee',
            mesh: group,
            phase: Math.random() * Math.PI * 2,
            speed: 1.2 + Math.random() * 0.8,
            radius: 1.5 + Math.random() * 2,
            centerX: startX,
            centerZ: startZ,
            height: 0.8 + Math.random() * 0.5,
            hoverTimer: 0,
            hoverDuration: 1 + Math.random() * 2,
            isHovering: false
        });
    },

    _createPetal(scene, index) {
        const petalColors = [0xFFB7C5, 0xFFD1DC, 0xFF9EBC, 0xFFC0CB, 0xFFE4E1];
        const color = petalColors[index % petalColors.length];
        const geo = new THREE.SphereGeometry(0.05 + Math.random() * 0.04, 5, 4);
        const mat = new THREE.MeshLambertMaterial({ color, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
        const petal = new THREE.Mesh(geo, mat);
        petal.scale.set(1.5, 0.2, 1.0);

        const startX = (Math.random() - 0.5) * 24;
        const startZ = (Math.random() - 0.5) * 24;
        const startY = 2 + Math.random() * 3;
        petal.position.set(startX, startY, startZ);

        scene.add(petal);
        this.particles.push({
            type: 'petal',
            mesh: petal,
            fallSpeed: 0.15 + Math.random() * 0.15,
            driftX: (Math.random() - 0.5) * 0.3,
            driftZ: (Math.random() - 0.5) * 0.3,
            rotSpeed: (Math.random() - 0.5) * 2,
            startY: startY,
            resetY: 3 + Math.random() * 2,
            resetX: (Math.random() - 0.5) * 24,
            resetZ: (Math.random() - 0.5) * 24
        });
    },

    // ===== 8. 粒子动画更新（在animate循环中调用）=====
    updateParticles(deltaTime, time) {
        this.particles.forEach(p => {
            if (!p.mesh) return;

            if (p.type === 'butterfly') {
                // 曲线飘飞
                p.phase += deltaTime * p.speed;
                const bx = p.centerX + Math.cos(p.phase) * p.radius;
                const bz = p.centerZ + Math.sin(p.phase * 0.7) * p.radius;
                const by = p.height + Math.sin(p.phase * 1.3) * 0.2;
                p.mesh.position.set(bx, by, bz);
                p.mesh.rotation.y = Math.atan2(
                    Math.cos(p.phase) * p.radius - p.mesh.position.x,
                    Math.sin(p.phase * 0.7) * p.radius - p.mesh.position.z
                );
                // 翅膀扇动
                p.wingPhase += deltaTime * 8;
                const wingAngle = Math.abs(Math.sin(p.wingPhase)) * 0.6;
                if (p.wings[0]) p.wings[0].rotation.y = wingAngle;
                if (p.wings[1]) p.wings[1].rotation.y = -wingAngle;

            } else if (p.type === 'bee') {
                // 快速直线+悬停
                p.hoverTimer += deltaTime;
                if (p.hoverTimer > p.hoverDuration) {
                    p.hoverTimer = 0;
                    p.isHovering = !p.isHovering;
                    if (!p.isHovering) {
                        p.centerX = (Math.random() - 0.5) * 16;
                        p.centerZ = (Math.random() - 0.5) * 16;
                    }
                }
                if (p.isHovering) {
                    // 悬停：小幅抖动
                    p.mesh.position.y = p.height + Math.sin(time * 8 + p.phase) * 0.03;
                } else {
                    // 飞向目标
                    const dx = p.centerX - p.mesh.position.x;
                    const dz = p.centerZ - p.mesh.position.z;
                    const dist = Math.sqrt(dx * dx + dz * dz);
                    if (dist > 0.1) {
                        p.mesh.position.x += (dx / dist) * p.speed * deltaTime;
                        p.mesh.position.z += (dz / dist) * p.speed * deltaTime;
                        p.mesh.rotation.y = Math.atan2(dx, dz);
                    }
                    p.mesh.position.y = p.height + Math.sin(time * 10 + p.phase) * 0.05;
                }

            } else if (p.type === 'petal') {
                // 缓慢旋转下落
                p.mesh.position.y -= p.fallSpeed * deltaTime;
                p.mesh.position.x += p.driftX * deltaTime;
                p.mesh.position.z += p.driftZ * deltaTime;
                p.mesh.rotation.z += p.rotSpeed * deltaTime;
                p.mesh.rotation.x += p.rotSpeed * 0.5 * deltaTime;
                // 落地后重置到高处
                if (p.mesh.position.y < 0.1) {
                    p.mesh.position.set(p.resetX, p.resetY, p.resetZ);
                    p.resetX = (Math.random() - 0.5) * 24;
                    p.resetZ = (Math.random() - 0.5) * 24;
                }
            }
        });
    }
};
