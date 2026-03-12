// ===== 游戏状态管理 =====

const GameState = {
    // 玩家基础数据
    player: {
        name: '农场主',
        level: 1,
        xp: 0,
        xpToNext: 100,
        gold: 1000,
        diamond: 50,
        energy: 100,
        maxEnergy: 100,
        streak: 0,
        maxStreak: 0,
        lastCheckin: null,
        checkinDays: [],
        totalHarvest: 0,
        totalGoldEarned: 0,
        rareHarvest: 0,
        legendaryHarvest: 0,
        goldenHarvests: 0,
        uniqueCrops: new Set(),
        totalAnimals: 0
    },
    
    // 农场土地（9块）
    plots: [],
    
    // 动物列表
    animals: [],
    
    // 背包
    inventory: {
        seeds: {},
        harvest: {},
        tools: {}
    },
    
    // 任务进度
    quests: {
        daily: {},
        weekly: {},
        main: {}
    },
    
    // 已解锁成就
    achievements: new Set(),
    
    // 游戏时间
    gameTime: {
        season: 'spring',
        seasonDay: 1,
        weather: 'sunny',
        weatherTimer: 0,
        lastUpdate: Date.now(),
        hour: 8,          // 游戏内小时（0-23）
        hourTimer: 0,     // 小时推进计时器（每60秒=1游戏小时）
        dayTimer: 0       // 天推进计时器
    },

    
    // 当前选中工具
    currentTool: 'seed',
    
    // 当前选中种子
    selectedSeed: 'radish',
    
    // 当前选中土地
    selectedPlot: -1,
    
    // 当前选中动物
    selectedAnimal: -1,
    
    // 能量恢复计时器
    energyTimer: 0,
    
    // 待种植的神秘种子袋类型
    pendingMysteryBag: null,
    
    // 图鉴数据
    pokedex: {},
    
    // 图鉴里程碑已领取
    pokedexMilestones: new Set(),

    // 扭蛋机系统
    gacha: {
        tokens: 3,              // 新手赠送3枚代币
        collections: [],        // 珍藏品列表
        hasFirstGacha: false,   // 首次扭蛋保底标记
        dailySeq: {},           // 每日序号
        lastDailyTokenDate: null,
        animalTokenDate: {},
        pokedexTokenMilestones: new Set()
    },

    // 初始化

    init() {
        // 初始化土地（9块）
        for (let i = 0; i < 9; i++) {
            this.plots.push({
                id: i,
                state: 'empty', // empty, planted, watered, fertilized, ready
                crop: null,
                plantTime: 0,
                growProgress: 0,
                watered: false,
                fertilized: false,
                quality: 'normal', // normal, fertile, magic
                cropQuality: 'normal' // normal, good, perfect
            });
        }
        
        // 初始化背包种子
        this.inventory.seeds = {
            radish: 5,
            lettuce: 3,
            mystery_normal: 2  // 新手赠送2个普通种子袋
        };

        
        // 初始化任务进度
        DAILY_QUESTS.forEach(q => {
            this.quests.daily[q.id] = { progress: 0, completed: false, claimed: false };
        });
        WEEKLY_QUESTS.forEach(q => {
            this.quests.weekly[q.id] = { progress: 0, completed: false, claimed: false };
        });
        MAIN_QUESTS.forEach(q => {
            this.quests.main[q.id] = { progress: 0, completed: false, claimed: false };
        });
        
        // 加载存档
        this.load();
    },
    
    // 保存游戏
    save() {
        const saveData = {
            player: {
                ...this.player,
                uniqueCrops: [...this.player.uniqueCrops]
            },
            plots: this.plots,
            animals: this.animals,
            inventory: this.inventory,
            quests: this.quests,
            achievements: [...this.achievements],
            gameTime: this.gameTime,
            pokedex: this.pokedex,
            pokedexMilestones: [...(this.pokedexMilestones || new Set())],
            gacha: {
                ...this.gacha,
                pokedexTokenMilestones: [...(this.gacha?.pokedexTokenMilestones || new Set())]
            }
        };


        try {
            localStorage.setItem('farm3d_save', JSON.stringify(saveData));
        } catch(e) {
            console.warn('保存失败:', e);
        }
    },
    
    // 加载游戏
    load() {
        try {
            const saved = localStorage.getItem('farm3d_save');
            if (!saved) return;
            const data = JSON.parse(saved);
            
            if (data.player) {
                this.player = { ...this.player, ...data.player };
                this.player.uniqueCrops = new Set(data.player.uniqueCrops || []);
            }
            if (data.plots) this.plots = data.plots;
            if (data.animals) this.animals = data.animals;
            if (data.inventory) this.inventory = data.inventory;
            if (data.quests) this.quests = data.quests;
            if (data.achievements) this.achievements = new Set(data.achievements);
            if (data.gameTime) {
                // 合并而非替换，保留新增字段的默认值
                this.gameTime = {
                    ...this.gameTime,
                    ...data.gameTime,
                    // 兼容旧存档：将旧天气名映射到新天气名
                    weather: ({'storm':'thunderstorm','heavy_rain':'heavy_rain'}[data.gameTime.weather] || data.gameTime.weather || 'sunny')
                };
                // 确保新字段存在
                if (this.gameTime.hour === undefined) this.gameTime.hour = 8;
                if (this.gameTime.hourTimer === undefined) this.gameTime.hourTimer = 0;
                if (this.gameTime.dayTimer === undefined) this.gameTime.dayTimer = 0;
            }

            if (data.pokedex) this.pokedex = data.pokedex;
            if (data.pokedexMilestones) this.pokedexMilestones = new Set(data.pokedexMilestones);
            if (data.gacha) {
                this.gacha = {
                    ...this.gacha,
                    ...data.gacha,
                    pokedexTokenMilestones: new Set(data.gacha.pokedexTokenMilestones || [])
                };
            }


            
            // 处理离线收益
            this.processOfflineProgress();
        } catch(e) {
            console.warn('加载存档失败:', e);
        }
    },
    
    // 处理离线进度
    processOfflineProgress() {
        const now = Date.now();
        const elapsed = Math.min((now - this.gameTime.lastUpdate) / 1000, 8 * 3600); // 最多8小时
        
        if (elapsed < 60) return; // 少于1分钟不处理
        
        // 更新作物生长
        this.plots.forEach(plot => {
            if (plot.state === 'planted' || plot.state === 'watered' || plot.state === 'fertilized') {
                const crop = CROPS_DATA[plot.crop];
                if (crop) {
                    let growRate = 1;
                    if (plot.watered) growRate *= 1.3;
                    if (plot.fertilized) growRate *= 1.2;
                    plot.growProgress = Math.min(1, plot.growProgress + (elapsed * growRate) / crop.growTime);
                    if (plot.growProgress >= 1) {
                        plot.state = 'ready';
                    }
                }
            }
        });
        
        // 更新动物产出
        this.animals.forEach(animal => {
            const animalData = ANIMALS_DATA[animal.type];
            if (animalData && animal.grown) {
                const productElapsed = Math.min(elapsed, animalData.productTime);
                animal.productProgress = Math.min(1, (animal.productProgress || 0) + productElapsed / animalData.productTime);
                if (animal.productProgress >= 1) {
                    animal.hasProduct = true;
                }
            }
        });
        
        this.gameTime.lastUpdate = now;
        
        if (elapsed > 300) { // 超过5分钟
            showNotification(`欢迎回来！离线${Math.floor(elapsed/60)}分钟，农场有新进展！`, '🌾');
        }
    },
    
    // 添加金币
    addGold(amount) {
        this.player.gold += amount;
        this.player.totalGoldEarned += amount;
        this.updateQuestProgress('gold', amount);
        this.checkAchievements();
        updateHUD();
    },
    
    // 消耗金币
    spendGold(amount) {
        if (this.player.gold < amount) return false;
        this.player.gold -= amount;
        updateHUD();
        return true;
    },
    
    // 添加钻石
    addDiamond(amount) {
        this.player.diamond += amount;
        updateHUD();
    },
    
    // 消耗钻石
    spendDiamond(amount) {
        if (this.player.diamond < amount) return false;
        this.player.diamond -= amount;
        updateHUD();
        return true;
    },
    
    // 添加经验
    addXP(amount) {
        this.player.xp += amount;
        while (this.player.xp >= this.player.xpToNext) {
            this.player.xp -= this.player.xpToNext;
            this.player.level++;
            this.player.xpToNext = Math.floor(100 * Math.pow(1.3, this.player.level - 1));
            this.onLevelUp();
        }
        updateHUD();
        this.checkAchievements();
    },
    
    // 升级回调
    onLevelUp() {
        showLevelUpEffect();
        showNotification(`🎉 升级到 ${this.player.level} 级！`, 'gold');
        // 升级奖励
        const goldReward = this.player.level * 100;
        this.addGold(goldReward);
        showNotification(`获得升级奖励 ${goldReward} 金币！`, '💰');
    },
    
    // 消耗能量
    spendEnergy(amount) {
        if (this.player.energy < amount) {
            showNotification('能量不足！', '⚡', 'warning');
            return false;
        }
        this.player.energy -= amount;
        updateHUD();
        return true;
    },
    
    // 恢复能量
    recoverEnergy(amount) {
        this.player.energy = Math.min(this.player.maxEnergy, this.player.energy + amount);
        updateHUD();
    },
    
    // 更新任务进度
    updateQuestProgress(type, amount = 1) {
        // 每日任务
        DAILY_QUESTS.forEach(q => {
            if (q.type === type && this.quests.daily[q.id]) {
                const quest = this.quests.daily[q.id];
                if (!quest.completed) {
                    quest.progress = Math.min(q.target, quest.progress + amount);
                    if (quest.progress >= q.target) {
                        quest.completed = true;
                        showNotification(`✅ 每日任务完成：${q.name}！`, 'gold');
                    }
                }
            }
        });
        
        // 每周任务
        WEEKLY_QUESTS.forEach(q => {
            if (q.type === type && this.quests.weekly[q.id]) {
                const quest = this.quests.weekly[q.id];
                if (!quest.completed) {
                    quest.progress = Math.min(q.target, quest.progress + amount);
                    if (quest.progress >= q.target) {
                        quest.completed = true;
                        showNotification(`✅ 每周任务完成：${q.name}！`, 'gold');
                    }
                }
            }
        });
        
        // 主线任务
        MAIN_QUESTS.forEach(q => {
            if (q.type === type && this.quests.main[q.id]) {
                const quest = this.quests.main[q.id];
                if (!quest.completed) {
                    quest.progress = Math.min(q.target, quest.progress + amount);
                    if (quest.progress >= q.target) {
                        quest.completed = true;
                        showNotification(`🎯 主线任务完成：${q.name}！`, 'gold');
                    }
                }
            }
        });
    },
    
    // 检查成就
    checkAchievements() {
        const p = this.player;
        ACHIEVEMENTS_DATA.forEach(ach => {
            if (this.achievements.has(ach.id)) return;
            
            let unlocked = false;
            if (ach.condition.includes('totalHarvest') && p.totalHarvest >= parseInt(ach.condition.split('>=')[1])) unlocked = true;
            if (ach.condition.includes('totalAnimals') && p.totalAnimals >= parseInt(ach.condition.split('>=')[1])) unlocked = true;
            if (ach.condition.includes('level') && p.level >= parseInt(ach.condition.split('>=')[1])) unlocked = true;
            if (ach.condition.includes('totalGoldEarned') && p.totalGoldEarned >= parseInt(ach.condition.split('>=')[1])) unlocked = true;
            if (ach.condition.includes('maxStreak') && p.maxStreak >= parseInt(ach.condition.split('>=')[1])) unlocked = true;
            if (ach.condition.includes('rareHarvest') && p.rareHarvest >= parseInt(ach.condition.split('>=')[1])) unlocked = true;
            if (ach.condition.includes('legendaryHarvest') && p.legendaryHarvest >= parseInt(ach.condition.split('>=')[1])) unlocked = true;
            if (ach.condition.includes('goldenHarvests') && p.goldenHarvests >= parseInt(ach.condition.split('>=')[1])) unlocked = true;
            if (ach.condition.includes('uniqueCrops') && p.uniqueCrops.size >= parseInt(ach.condition.split('>=')[1])) unlocked = true;
            
            if (unlocked) {
                this.achievements.add(ach.id);
                showNotification(`🏆 解锁成就：${ach.name}！`, 'gold');
                this.addGold(ach.reward);
                this.addXP(ach.xp);
            }
        });
    },
    
    // 获取等级称号
    getLevelTitle() {
        let title = '新手农夫';
        for (const t of LEVEL_TITLES) {
            if (this.player.level >= t.level) title = t.title;
        }
        return title;
    },
    
    // 游戏主循环更新
    update(deltaTime) {
        const now = Date.now();
        
        // 能量恢复（每72秒恢复1点，原6分钟提速5倍）
        this.energyTimer += deltaTime;
        if (this.energyTimer >= 72) {

            this.energyTimer = 0;
            if (this.player.energy < this.player.maxEnergy) {
                this.recoverEnergy(1);
            }
        }
        
        // 更新作物生长
        this.plots.forEach(plot => {
            if (plot.state === 'planted' || plot.state === 'watered' || plot.state === 'fertilized') {
                const crop = CROPS_DATA[plot.crop];
                if (!crop) return;
                
                let growRate = 1;
                const weather = WEATHER_DATA[this.gameTime.weather] || WEATHER_DATA['sunny'];
                growRate *= weather.growBonus;

                if (plot.watered) growRate *= 1.3;
                if (plot.fertilized) growRate *= 1.2;
                if (this.gameTime.season === 'spring' && SEASONS_DATA.spring.bonusCrops.includes(plot.crop)) growRate *= 1.2;
                if (this.gameTime.season === 'summer' && SEASONS_DATA.summer.bonusCrops.includes(plot.crop)) growRate *= 1.2;
                if (this.gameTime.season === 'autumn' && SEASONS_DATA.autumn.bonusCrops.includes(plot.crop)) growRate *= 1.2;
                
                plot.growProgress = Math.min(1, plot.growProgress + (deltaTime * growRate) / crop.growTime);
                
                if (plot.growProgress >= 1 && plot.state !== 'ready') {
                    plot.state = 'ready';
                    showNotification(`${crop.icon} ${crop.name} 已成熟，可以收获了！`, '🌾');
                    if (typeof Scene3D !== 'undefined') Scene3D.updatePlot(plot);
                }

            }
        });
        
        // 更新动物
        this.animals.forEach(animal => {
            const animalData = ANIMALS_DATA[animal.type];
            if (!animalData) return;
            
            // 成长
            if (!animal.grown) {
                animal.growProgress = Math.min(1, (animal.growProgress || 0) + deltaTime / animalData.growTime);
                if (animal.growProgress >= 1) {
                    animal.grown = true;
                    showNotification(`${animalData.icon} ${animal.name} 已长大！`, '🐾');
                }
            }
            
            // 产出
            if (animal.grown && !animal.hasProduct) {
                animal.productProgress = Math.min(1, (animal.productProgress || 0) + deltaTime / animalData.productTime);
                if (animal.productProgress >= 1) {
                    animal.hasProduct = true;
                    showNotification(`${animalData.icon} ${animal.name} 有产出了！`, '🥚');
                }
            }
            
            // 心情下降（每小时-5）
            animal.mood = Math.max(0, (animal.mood || 100) - deltaTime / 720);
        });
        
        // 游戏时钟推进（每60秒=1游戏小时）
        this.gameTime.hourTimer += deltaTime;
        if (this.gameTime.hourTimer >= 60) {
            this.gameTime.hourTimer = 0;
            this.gameTime.hour = (this.gameTime.hour + 1) % 24;
            // 每天早晨6点：指定领头牛、每日重置
            if (this.gameTime.hour === 6) {
                if (typeof AnimalBehavior !== 'undefined') {
                    AnimalBehavior.assignCowLeader(Scene3D.animalMeshes);
                    AnimalBehavior.dailyUpdate(this.animals);
                }
            }
        }

        // 天气变化（每5分钟随机变化）
        this.gameTime.weatherTimer += deltaTime;
        if (this.gameTime.weatherTimer >= 300) {
            this.gameTime.weatherTimer = 0;
            this.changeWeather();
        }

        // AnimalBehavior系统更新（Map缓存已在AnimalBehavior内部维护）
        if (typeof AnimalBehavior !== 'undefined' && typeof Scene3D !== 'undefined'
            && Scene3D.animalMeshes && Scene3D.animalMeshes.length > 0) {
            AnimalBehavior.update(deltaTime, Scene3D.animalMeshes, this.animals, this.gameTime.weather, this.gameTime.hour);
        }

        // 扭蛋机：每日任务代币检查 & 动物好感度代币（每分钟检查一次）
        if (!this._gachaCheckTimer) this._gachaCheckTimer = 0;
        this._gachaCheckTimer += deltaTime;
        if (this._gachaCheckTimer >= 60) {
            this._gachaCheckTimer = 0;
            if (typeof GachaSystem !== 'undefined') {
                GachaSystem.checkDailyTaskTokens();
                GachaSystem.checkAnimalTokens();
                GachaSystem.checkPokedexTokens();
                // 更新HUD代币数量
                const badge = document.getElementById('gacha-token-badge');
                if (badge) badge.textContent = this.gacha?.tokens || 0;
            }
        }



        
        // 季节推进（每7天换季）
        // 简化：每30分钟推进1天
        
        this.gameTime.lastUpdate = now;
    },
    
    // 改变天气
    changeWeather() {
        // 8种天气权重（季节影响）
        const season = this.gameTime.season;
        let pool;
        if (season === 'winter') {
            pool = ['sunny', 'cloudy', 'overcast', 'snow', 'snow', 'blizzard'];
        } else if (season === 'summer') {
            pool = ['sunny', 'sunny', 'sunny_cloudy', 'cloudy', 'rainy', 'thunderstorm'];
        } else if (season === 'spring') {
            pool = ['sunny', 'sunny_cloudy', 'cloudy', 'rainy', 'rainy', 'overcast'];
        } else { // autumn
            pool = ['sunny', 'sunny_cloudy', 'cloudy', 'overcast', 'rainy', 'heavy_rain'];
        }
        const newWeather = pool[Math.floor(Math.random() * pool.length)];
        if (newWeather !== this.gameTime.weather) {
            const prev = this.gameTime.weather;
            this.gameTime.weather = newWeather;
            updateWeatherDisplay();

            // 天气视觉系统切换
            if (typeof WeatherSystem !== 'undefined' && typeof Scene3D !== 'undefined') {
                WeatherSystem.setWeather(newWeather, Scene3D);
            }

            // 通知
            const icons = { sunny:'☀️', sunny_cloudy:'⛅', cloudy:'☁️', overcast:'🌫️', rainy:'🌧️', heavy_rain:'⛈️', snow:'🌨️', blizzard:'❄️', thunderstorm:'⚡' };
            const names = { sunny:'晴天', sunny_cloudy:'晴间多云', cloudy:'多云', overcast:'阴天', rainy:'小雨', heavy_rain:'大雨', snow:'小雪', blizzard:'暴风雪', thunderstorm:'雷暴' };
            showNotification(`${icons[newWeather]||'🌤'} 天气变为${names[newWeather]||newWeather}`, 'info');

            // 雨天自动浇水
            if (newWeather === 'rainy' || newWeather === 'heavy_rain' || newWeather === 'thunderstorm') {
                showNotification('🌧️ 下雨了，作物自动浇水！', '💧');
                this.plots.forEach(plot => {
                    if (plot.state === 'planted') {
                        plot.watered = true;
                        plot.state = 'watered';
                    }
                });
            }
            // 大雨风险提示
            if (newWeather === 'heavy_rain' || newWeather === 'thunderstorm') {
                showNotification('⚠️ 大雨来临！注意保护作物！', 'warning');
            }
            // 雪天提示
            if (newWeather === 'snow' || newWeather === 'blizzard') {
                showNotification('❄️ 下雪了！记得给动物开暖气！', 'warning');
            }
        }
    }

};
