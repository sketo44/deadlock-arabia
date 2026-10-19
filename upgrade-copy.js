// Authored names for every upgrade field in the shipped ability data.
// Numbers, units, and scaling modes come from the game data, never a translation API.
export const upgradeNames=Object.fromEntries(`
AbilityCooldown|وقت انتظار القدرة
AbilityCharges|عدد شحنات القدرة
ImpactDamage|ضرر الاصطدام
DPS|الضرر كل ثانية
AbilityCooldownBetweenCharge|الانتظار بين الشحنات
SpeedOnLand|سرعة الحركة بعد الهبوط
SpeedOnLandDuration|مدة زيادة السرعة بعد الهبوط
StompStunDuration|مدة الستان عند الهبوط
Damage|الضرر
AbilityDuration|مدة تأثير القدرة
FadingSlowPercent|قوة التبطيء اللي يخف تدريجيًا
BulletResistReduction|مقاومة الخصم للرصاص
BulletResistReductionDuration|مدة تقليل مقاومة الرصاص
AbilityCooldownPerHeadshot|انتظار القدرة مع كل هيدشوت
AbilityCooldownPerHeadshotNPC|انتظار القدرة مع هيدشوت على كريب أو وحش
SlowPercent|قوة تبطيء الحركة
SlowDuration|مدة التبطيء
StunDuration|مدة الستان
WeaponDamageBonus|ضرر السلاح الإضافي
WeaponPowerIncreaseDuration|مدة زيادة ضرر السلاح
BonusMaxHealth|أقصى صحتك
MeleeLifesteal|اللايف ستيل من الميلي
RegenIncomingDamagePercent|نسبة الضرر اللي ترجع لك كصحة
StatusResistancePercent|مقاومة الديبف
ImmunityDuration|مدة الحصانة
ImpactRadius|مساحة تأثير الاصطدام
Radius|مساحة التأثير
UppercutBuffOnHit|مدة البف بعد إصابة Uppercut
BuffBaseWeaponPct|نسبة زيادة ضرر السلاح من البف
RestoreHookCooldown|إعادة تجهيز الخطاف
MissingHPHeal|نسبة العلاج من الصحة الناقصة
MovementSpeedBonus|سرعة الحركة الإضافية
MovementSpeedBonusDuration|مدة زيادة سرعة الحركة
BeamLifesteal|اللايف ستيل من الشعاع
BeamLifestealNonHeroPercent|فعالية لايف ستيل الشعاع على غير اللاعبين
BulletAmp|زيادة ضرر الرصاص على الهدف
BulletAmpDuration|مدة زيادة ضرر الرصاص
AbilityCastRange|مدى استخدام القدرة
PulseDamage|ضرر كل نبضة
DamageAmplificationPerStack|زيادة ضررك على الهدف لكل ستاك
TimeWallWidth|عرض الجدار
TimeWallHeight|ارتفاع الجدار
FriendlyBulletDamageBonus|ضرر رصاص الفريق المار بالجدار
DebuffDuration|مدة الديبف على الخصم
MaxSlowDuration|أقصى مدة إيقاف الزمن
SpeedChange|زيادة سرعة الحركة
SpeedBoostDuration|مهلة الاحتفاظ بالطلقة المشحونة
MaxBonusBulletDamage|أقصى ضرر إضافي للطلقة
CombatBarrier|قوة الدرع اللي يمتص الضرر
BarrierDuration|مدة الدرع
MultiSwap|مساحة تبديل عدة أهداف
MaxHealthDamage|الضرر كنسبة من أقصى الصحة
StompRange|مدى النبضة
ReduceDebuffs|تخفيف التأثيرات السلبية
ChargeReplenish|الشحنات اللي ترجع عند الاستخدام
AbilityChannelTime|مدة توجيه القدرة
NoChannel|استخدام القدرة بدون استمرار التوجيه
HealMaxHealthPercent|العلاج من أقصى الصحة كل ثانية
VacuumRadius|مساحة سحب الأعداء
DPSPercentHealth|ضرر كل ثانية كنسبة من أقصى الصحة
StaminaCooldownReduction|سرعة رجوع الستامينا
MaxHealthRegenPct|تجدد الصحة كنسبة من أقصى الصحة
HealRadius|مدى وصول العلاج
SpiritResist|مقاومة السبيرت
TurretAttackRange|مدى هجوم البرج
TurretDPS|ضرر البرج كل ثانية
AttackSpeedMult|سرعة إطلاق البرج
TurretLifetime|مدة بقاء البرج
BonusDamagePercent|نسبة الضرر الإضافي
CreateTurrets|عدد الأبراج اللي تنشئها القدرة
TurretLifeTime|مدة الأبراج اللي تنشئها القدرة
MoveSlowPercent|قوة تبطيء الحركة
EnemyDashSlowPercent|تقليل داش الخصم
MoveSlowDuration|مدة تبطيء الحركة
DamagePerRocket|ضرر كل صاروخ
ExplosionRadius|مساحة الانفجار
BloodSpillDPSPercent|ضرر بركة الدم كنسبة من ضرر القنبلة
BloodSpillDuration|مدة بقاء بركة الدم
HealthToDamage|الضرر الناتج من التضحية بالصحة
NumBloodShards|عدد شظايا الدم
SpreadAngleDegrees|زاوية انتشار الشظايا
VulnerabilityPerStack|الضرر الإضافي على الهدف لكل ستاك
LifeDrainPerSecond|سحب الصحة كل ثانية
SilenceDuration|مدة السايلنس
SilenceRadius|مساحة السايلنس
SelfBuffDuration|مدة البف عليك
TechResist|مقاومة السبيرت
BonusFireRate|سرعة الإطلاق
BonusSpirit|قوة السبيرت
MaxLifetime|مدة بقاء تأثير القدرة
ShockRadius|مساحة الكهرباء
BonusMoveSpeed|سرعة الحركة
BonusPerChain|ضرر انتقال الكهرباء
DamagePerChain|ضرر صعقة الكهرباء
TechResistDebuff|مقاومة الخصم للسبيرت
BulletResistOnActive|مقاومة الرصاص أثناء القدرة
InitialRadius|مساحة التأثير بالبداية
FlightControlEnabled|سرعة التحرك أثناء الطيران
SleepDuration|مدة النوم
FixationStacks|ستاكات Fixation على الخصم
GroundDashReductionPercent|مسافة داش الخصم
InvisMoveSpeedMod|سرعة الركض أثناء التخفي
BulletLifesteal|اللايف ستيل من الرصاص
PostInvisBuffDuration|مدة البف بعد التخفي
DispelOnUse|إزالة التأثيرات السلبية عند الاستخدام
ProcDamage|ضرر تفعيل التأثير
ProcDamageStackCount|الستاكات المطلوبة لتفعيل الضربة
MaxStacks|أقصى عدد ستاكات
DamageBonusFixedPerStack|ضرر السلاح لكل ستاك
ChannelMoveSpeed|سرعة الحركة أثناء الألتمت
EvasionPercent|فرصة تفادي الرصاص
ChainDuration|مدة ربط الخصم
CaptureRadius|مساحة التقاط الأعداء
BonusClipSizePercent|سعة مخزن السلاح
MagicDamagePerBullet|ضرر السبيرت لكل طلقة
RefreshOnKill|تجديد القدرة عند الكيل
HealAmpReceivePenaltyPercent|العلاج اللي يستقبله الخصم
HealAmpRegenPenaltyPercent|تجدد صحة الخصم
DotHealthPercent|ضرر النزيف كنسبة من الصحة كل ثانية
TechArmorDamageReduction|مقاومة السبيرت
LowHealthEnemyDamageBonus|ضرر إضافي على الخصم بصحة قليلة
WeaponDamageBonusPerKill|ضرر السلاح المكتسب لكل كيل
LifeStealPercentOnHit|العلاج كنسبة من ضرر الإصابة
GroundFlameDuration|مدة بقاء مسار النار
LifestealPercentHero|اللايف ستيل ضد اللاعبين
IncomingDamagePercentFromCaster|زيادة الضرر اللي يستقبله الخصم منك
OutgoingTechDamagePercent|ضرر السبيرت اللي يسببه الخصم
BurnDuration|مدة الحرق
MaxSlowPercent|أقصى تبطيء للحركة
MaxFireRateSlowPercent|أقصى تخفيض لسرعة الإطلاق
BeamSplit|مدى وصول الشعاع الإضافي
BeamSplitCount|عدد الأهداف الإضافية للشعاع
MoveSpeedBonus|سرعة الحركة
BulletResist|مقاومة الرصاص
BonusSpiritPct|نسبة زيادة قوة السبيرت
HealAmount|كمية العلاج
PauseStaminaRegen|إيقاف تجدد ستامينا الخصم
BonusHealthRegen|تجدد الصحة
PurgeOnCast|إزالة التأثيرات السلبية عند التفعيل
WeaponDamageBonusDuration|مدة زيادة ضرر السلاح
RestoreStaminaOnUse|الستامينا المسترجعة عند الاستخدام
AirControlPercent|التحكم بالحركة بالهواء
EnemySlowPct|قوة تبطيء حركة الخصم
StompBounceHeight|ارتفاع الارتداد بعد الضربة
TossDuration|مدة رفع الخصم
StompDamagePerMeterPrimary|ضرر الهبوط لكل متر ارتفاع
StompDamagePerMeterSecondary|ضرر الهبوط لكل متر فوق 25 متر
ThrowDistance|أقصى مسافة لرمي الأعداء
EnemySlowDuration|مدة تبطيء الخصم
FireRateSlow|تخفيض سرعة إطلاق الخصم
TargetingConeAngle|زاوية وصول الضربة
HealPctVsHeroes|العلاج من ضرر اللاعبين
HealPctVsNonHeroes|العلاج من ضرر غير اللاعبين
WhirlwindEvasionChance|فرصة تفادي الرصاص بعد الزوبعة
RecastWindow|مهلة إعادة التفعيل
MovementSpeedSlow|قوة تبطيء الحركة
ProcDamageBase|ضرر التفعيل الأساسي
VictimStackDuration|مدة بقاء علامة الجن
ProcCooldown|وقت الانتظار لكل هدف
StealDuration|مدة تأثير السرقة
OutgoingDamagePenaltyPercent|الضرر اللي يسببه الخصم
DamageBonus|الضرر الإضافي
BuffDuration|مدة البف
MaxBonusMoveSpeedPercent|أقصى زيادة لسرعة الحركة
HealthRegen|تجدد الصحة
OutgoingDamagePercent|الضرر الصادر
DamageAmpDuration|مدة زيادة الضرر
DamageAmpBuildDuration|وقت تراكم زيادة الضرر
MeleeResistReduction|مقاومة الخصم للميلي
MeleeResistReductionDuration|مدة تقليل مقاومة الميلي
GrenadeCount|عدد القنابل
BonusMoveSpeedPercent|نسبة زيادة سرعة الحركة
RefundCooldowns|إعادة تجهيز القدرات
BonusGoldOnKill|سولز إضافية عند الكيل
BountyDuration|مهلة الحصول على مكافأة الكيل
CooldownRefundPercent|نسبة استرجاع وقت الانتظار
BulletLifestealPercent|اللايف ستيل من الرصاص
TechLifestealPercent|اللايف ستيل من السبيرت
BulletArmorReduction|تأثير تقليل مقاومة الرصاص
TetherDuration|مدة الربط واللعنة
LowHealthEnemyThresholdPct|نسبة الصحة المطلوبة لإنهاء الخصم
BleedDuration|مدة النزيف
BleedDPSPerStack|ضرر النزيف كل ثانية لكل سكين
DashRange|مسافة الاندفاع
CooldownReductionOnHit|تقليل الانتظار عند إصابة لاعب
CooldownReductionOnHitNonHero|تقليل الانتظار عند إصابة كريب أو وحش
MaxCooldownReductionsFromHits|أقصى تقليل انتظار من الإصابات
DeferClearPct|نسبة الضرر المؤجل اللي تمسحها
DamagePctDeferred|نسبة الضرر اللي يتأجل
BuffDamage|زيادة الضرر عند امتلاء الغضب
EnemyHealthPercent|حد صحة الخصم للتنفيذ
DamagePerProjectile|ضرر كل مقذوف
AmpPercentPerStack|زيادة الضرر لكل ستاك
DisableHealing|منع العلاج
TimeToEntangle|الوقت قبل التثبيت
EntangleDuration|مدة تثبيت الأعداء
MaxHealthRegen|العلاج كنسبة من أقصى صحتك
AirDropBulletShield|درع Air Drop
ExplodeDamage|ضرر الانفجار
MaxBounces|أقصى عدد ارتدادات
PostCubeBuff|استمرار بف المكعب بعد الخروج
PurgeDebuffs|إزالة التأثيرات السلبية
UseHeavyMelee|احتساب الضربة كميلي ثقيل
DamageHeavyMelee|ضرر الميلي الثقيل
BulletArmorReductionDuration|مدة تقليل مقاومة الرصاص
ImmobilizeDuration|مدة تثبيت الخصم بمكانه
SilenceDebuff|تطبيق سايلنس
MoveSpeedBonusPct|نسبة زيادة سرعة الحركة
StaminaReduction|الستامينا اللي تنقص من الخصم
WeaponPowerDebuff|ضرر سلاح الخصم
PulseDPS|ضرر النبضات كل ثانية
UnstoppableCastDelay|الحماية من التعطيل أثناء تجهيز القدرة
TossDistance|مسافة رمي الهدف
UnlimitedAmmo|ذخيرة بدون حد أثناء التأثير
ImprovedJokerChance|فرصة ورقة الجوكر
SpadeDamageBonus|ضرر ورقة البستوني الإضافي
DiamondResistShred|مقاومة الخصم للرصاص والسبيرت من ورقة الماس
HeartHeal|علاج ورقة القلب
ClubSlowPercent|تبطيء ورقة السباتي
FullChargeDamage|ضرر الضربة المشحونة بالكامل
SlashLength|مدى ضربة السيف
SpiritBonus|قوة السبيرت الإضافية
CanGrappleAllyHeroes|الاندفاع إلى الحلفاء
BuffMeleeDamage|ضرر الميلي الإضافي
HealMaxHealth|العلاج كنسبة من أقصى الصحة
HealFixedHealth|العلاج عند إصابة لاعب
SlideScale|مسافة السلايد
Stamina|نقاط الستامينا
VenomMaxDamage|أقصى ضرر للسم
BuildUpPerShot|التراكم لكل طلقة
BulletResistReductionPerStack|مقاومة الخصم للرصاص لكل ستاك
PetrifyDamage|ضرر التحجر
PetrifyDuration|مدة التحجر
MaxDamage|أقصى ضرر
CloneDamagePercentage|نسبة ضرر المساعد
LeashRadius|أقصى مسافة للمساعد
HexDuration|مدة التحويل لأرنب
DamageAmpPercentage|زيادة الضرر على الهدف
BonusBullets|عدد الطلقات الإضافية
MaxRecasts|مرات إعادة التفعيل
BonusDamage|الضرر الإضافي
PerTargetCooldown|الانتظار لكل هدف
CurrentHealthPercent|الضرر كنسبة من الصحة الحالية
RakeHealPerKill|العلاج لكل كيل
MissingHealthDamagePercentage|الضرر كنسبة من الصحة الناقصة
TotalHealthRegen|إجمالي الصحة المسترجعة
MinDps|أقل ضرر كل ثانية
MaxDPS|أقصى ضرر كل ثانية
IncomingDamagePercent|الضرر اللي يستقبله الهدف
BonusDamagePerBullet|الضرر الإضافي لكل طلقة
RespawnHealthPercent|نسبة الصحة عند الرجوع للحياة
MissingHealthPercentHeal|العلاج من الصحة الناقصة
DragonTravelRange|مسافة طيران التنين
BonusTargets|عدد الأهداف الإضافية
BonusTargetsBarrierPercentage|قوة الدرع للأهداف الإضافية
KnightCount|عدد الفرسان والخيول
KnightCountInFirstWave|عدد الفرسان بالموجة الأولى
MaxAmp|أقصى تضخيم للتأثير
DoorwayDistance|المسافة المسموحة بين البابين
CartDamage|ضرر العربة
WallImpactDamage|ضرر اصطدام الخصم بالجدار
ExplosionDamage|ضرر الانفجار
ProjectileFuse|المدة قبل انفجار الجرس
StaminaDrain|استنزاف الستامينا كل ثانية
LateCheckoutDamage|ضرر التأخر بالخروج من الفندق
LateCheckoutStun|ستان التأخر بالخروج
UnstoppableWhileHotelOccupied|الحماية من التعطيل والهدف داخل الفندق
LateCheckoutCooldown|وقت الانتظار المرتبط بتأخر الخروج
GainSlamOnUse|تجهيز ضربة Bashdown عند الاستخدام
BulletDamageAmp|زيادة ضرر الرصاص على حالة Wrecked
MaxHealthMelee|الصحة الإضافية من الميلي
UnstoppablePerHero|مدة الحماية من التعطيل لكل لاعب
WeaponDamageBurst|زيادة ضرر السلاح المؤقتة
WeaponDamageBurstDuration|مدة زيادة ضرر السلاح
MaxHealthBuffPct|نسبة زيادة أقصى الصحة
MaxHealthBuffDuration|مدة زيادة الصحة
CountsAsLightMelee|احتساب الضربة كميلي خفيف
CountsAsHeavyMelee|احتساب الضربة كميلي ثقيل
HeavyMeleeDamage|ضرر الميلي الثقيل
MeleeDamage|ضرر الميلي
HealOnKillPct|علاج الصحة الناقصة عند الكيل
StaminaToRestore|الستامينا اللي ترجع
AmpDamagePercent|نسبة تضخيم الضرر
BonusSprintSpeed|سرعة الركض
MaxTargets|أقصى عدد أهداف
AllStakesBlessed|تقوية كل طلقات الأوتاد
BurnRadius|مساحة الحرق
ConsumeStaminaOnWake|الستامينا المسحوبة عند الاستيقاظ
NoStaminaRegenDuringSleep|منع تجدد الستامينا أثناء النوم
DamageResistPctWhileChanneling|مقاومة الضرر أثناء التوجيه
UnstoppableWhileChanneling|الحماية من التعطيل أثناء التوجيه
HelperCount|عدد المساعدين
InfestDamageTakenPercent|تأثير الضرر والمقاومات للمساعد
TechArmorGain|مقاومة السبيرت المكتسبة
BonusBarrierAmpPercent|فعالية الدرع الإضافية
BonusItemDurationPercent|مدة تأثير الأيتمات الإضافية
BonusItemRangePercent|مدى الأيتمات الإضافي
TechPowerPercent|نسبة زيادة قوة السبيرت
BonusSpiritPower|قوة السبيرت الإضافية
HopOffEffecDuration|مدة البف بعد الانفصال عن الحليف
MissingHealthBurstPct|دفعة العلاج من الصحة الناقصة
HealingPerSecond|الصحة المسترجعة كل ثانية
BonusBulletSpeedPercent|نسبة زيادة سرعة الطلقات
ResetsAirLimit|إعادة تجهيز القفزات والداشات الهوائية
RecastTime|مهلة إعادة الاستخدام
TargetLifesteal|اللايف ستيل من الرصاص والسبيرت ضد الهدف
TargetLifestealDuration|مدة اللايف ستيل ضد الهدف
DashBuffDuration|مدة بف الاندفاع
BaseDamage|ضرر الضربة الأساسي
MaxDamageBeforePerfect|أقصى ضرر قبل النافذة المثالية
PerfectDamage|ضرر التوقيت المثالي
AttackDashRange|مسافة الاندفاع الهجومي
DashSpeed|سرعة الاندفاع
ZombieWallLength|طول جدار الأيدي
SummonCount|عدد الغيلان المستدعاة
HealPerPickup|العلاج لكل التقاط
SkullCount|عدد Deadheads
SkullLifetime|مدة بقاء Deadheads
MoveSpeedPercent|نسبة زيادة سرعة الحركة
SummonFrequency|الانتظار بين الاستدعاءات
CurrentHealthDamagePercentage|ضرر كنسبة من الصحة الحالية
MaxStolenSpiritResist|أقصى مقاومة سبيرت مسروقة
MaxStolenAttackDamage|أقصى ضرر سلاح مسروق
SkullBuildUp|التراكم من إصابات Deadheads
ZombieMeleeBuildUp|التراكم من ميلي الغيلان
ZombieExplosionBuildUp|التراكم من انفجار الغيلان
MaxStolenTargets|أقصى عدد أهداف للسرقة
BaseAttackDamagePercent|نسبة ضرر السلاح
StackDuration|مدة الستاك
BonusCurrentHealthDamagePercentage|ضرر إضافي كنسبة من الصحة الحالية
StaminaRestore|الستامينا المسترجعة
RicochetCount|عدد ارتدادات القدرة
RicochetRange|مدى انتقال القدرة بين الأهداف
BonusHealth|الصحة الإضافية
KillDurationBonus|مدة إضافية لكل كيل
KillCreditWindow|مهلة احتساب الكيل
AbilityLifestealPercentHero|اللايف ستيل من السبيرت ضد اللاعبين
MagicIncreasePerStack|زيادة ضرر السبيرت لكل ستاك
FireRatePerStack|سرعة الإطلاق لكل ستاك
MoveDistance|مسافة تحريك القطعة
MaxPieces|أقصى عدد قطع منشورة
TechArmorDamageReductionPerStack|مقاومة السبيرت لكل ستاك
TileSteps|مدى التأثير بالمربعات
BonusTargetRadius|مدى الوصول للأهداف الإضافية
RemoveDebuffs|إزالة التأثيرات السلبية
MaxReflectCount|عدد الارتدادات من الجدران
CheckmateThreshold|حد تفعيل كش مات
QueenBonusMoves|حركات الملكة الإضافية
HeatDrainRate|معدل تفريغ الحرارة
HealOnHit|العلاج عند الإصابة
SelfDamageReductionOnPlayerHitPercent|تقليل ضررك على نفسك عند إصابة لاعب
OverheatLockoutDurationReductionOnPlayerHitPercent|تقليل تعطّل الجهاز بعد الحرارة عند إصابة لاعب
CoatedDamage|الضرر الإضافي على الهدف المعلّم
MarksTotal|عدد الصواريخ والعلامات
Range|مدى القدرة
DamagePerMeter|ضرر السقوط لكل متر
ScorchDamage|ضرر الانفجار الخلفي
BurstMarkStacks|ستاكات العلامة عند الانفجار
RatSwarmCols|عدد أعمدة سرب الفئران
RatSwarmRows|عدد صفوف سرب الفئران
RatSwarmWidth|عرض انتشار سرب الفئران
ArmorReductionPerBite|مقاومة رصاص الخصم لكل عضة
DamagePerBite|ضرر كل عضة
DamagePerShrapnel|ضرر كل انفجار خردة
Detonations|عدد الانفجارات
BigExplosionDamage|ضرر الانفجار الكبير
BigExplosionRadius|مساحة الانفجار الكبير
BigExplosionSlowPercent|قوة تبطيء الانفجار الكبير
ReturnFireChance|فرصة رد الرصاص على المهاجم
MaxHealthPct|قوة الدرع كنسبة من أقصى صحتك
MaxDamagePerHit|حد الضرر لكل ضربة
FlagDuration|مدة بقاء الراية
AllyDamageReduction|تقليل الضرر على الحلفاء
`.trim().split('\n').map(line=>line.split('|')));

const flags={DestroyOnDamage:'الحبر ما عاد يتكسر عند تفعيل ضرره على عدو يغادر الدائرة.',RestoreHookCooldown:'يرجع الخطاف جاهز للاستخدام.',NoChannel:'تقدر تستخدم القدرة بدون الاستمرار في توجيهها.',DispelOnUse:'يشيل التأثيرات السلبية عند استخدام القدرة.',RefreshOnKill:'القدرة تتجدد عند الحصول على كيل.',PauseStaminaRegen:'يوقف تجدد ستامينا الخصم أثناء التأثير.',PurgeOnCast:'يشيل التأثيرات السلبية عند التفعيل.',RefundCooldowns:'يرجع يجهّز القدرات عند تحقق تأثير الترقية.',DisableHealing:'يمنع العلاج أثناء التأثير.',PostCubeBuff:'بف المكعب يستمر بعد ما تخرج منه.',PurgeDebuffs:'يشيل التأثيرات السلبية.',UseHeavyMelee:'ضربة القدرة تُحسب كميلي ثقيل.',SilenceDebuff:'القدرة تطبّق سايلنس على الخصم.',UnstoppableCastDelay:'يحميك من التعطيل أثناء تجهيز القدرة.',UnlimitedAmmo:'تصير الذخيرة بدون حد أثناء التأثير.',CanGrappleAllyHeroes:'تقدر تستخدم الاندفاع على حليف أيضًا.',UnstoppableWhileHotelOccupied:'يحميك من التعطيل طول ما الهدف داخل الفندق.',GainSlamOnUse:'يجهّز ضربة Bashdown عند الاستخدام.',CountsAsHeavyMelee:'ضربة القدرة تُحسب كميلي ثقيل.',AllStakesBlessed:'كل طلقات الأوتاد تصير مباركة بدل الطلقة الأخيرة فقط.',NoStaminaRegenDuringSleep:'الخصم ما تتجدد ستاميناه أثناء النوم.',UnstoppableWhileChanneling:'يحميك من التعطيل أثناء توجيه القدرة.',ResetsAirLimit:'يرجع يجهّز القفزات والداشات الهوائية.',RemoveDebuffs:'يشيل التأثيرات السلبية عن الهدف.'};
const unitOverrides={BonusFireRatePerStack:'%',BulletDamageMultiplier:'%',CooldownReductionPerHit:'s',TechPower:'',MeleeResist:'%',BrewEffectiveness:'%',SpiritResistReduction:'%',MaxSlow:'%',BonusMaxHealth:'',MeleeLifesteal:'%',StatusResistancePercent:'%',BuffBaseWeaponPct:'%',BeamLifesteal:'%',BeamLifestealNonHeroPercent:'%',BulletAmp:'%',SpiritResist:'%',TechResistDebuff:'%',BulletLifesteal:'%',LifeStealPercentOnHit:'%',BonusSpiritPct:'%',AttackSpeedMult:'%',BloodSpillDPSPercent:'%',BonusTargetsBarrierPercentage:'%',BuffMeleeDamage:'%',BonusItemRangePercent:'%',SelfDamageReductionOnPlayerHitPercent:'%',OverheatLockoutDurationReductionOnPlayerHitPercent:'%',BulletResistReductionDuration:'s',TurretLifeTime:'s',DamageAmpDuration:'s',DamageAmpBuildDuration:'s',TimeToEntangle:'s',EntangleDuration:'s',LateCheckoutStun:'s',LateCheckoutCooldown:'s',RecastTime:'s',DashBuffDuration:'s',KillCreditWindow:'s',BonusTargetRadius:'m',RicochetRange:'m',SpreadAngleDegrees:'°',MaxCooldownReductionsFromHits:'s'};
const fmt=value=>Number(value).toLocaleString('en-US',{maximumFractionDigits:4});
function amount(n,rawUnit){let unit=String(rawUnit||'').trim();const units={s:'ثانية',m:'متر','m/s':'متر/ثانية','%':'%','%/s':'% من أقصى الصحة كل ثانية','% DPS':'% من الصحة كل ثانية','% of Max Health':'% من أقصى الصحة','/s':'كل ثانية','/stack':'لكل ستاك','/ meter':'لكل متر'};return fmt(n)+(unit==='%'?'%':unit?' '+(units[unit]||unit):'')}
export function explainUpgrade(ability,p){
 const meta=ability.upgradeProperties?.[p.name]||ability.properties?.[p.name]||{},name=upgradeNames[p.name];
 if(!name)return {text:'تأثير جديد يحتاج مراجعة الشرح العربي. راجع النص الأصلي تحت.',review:false};
 const n=Number.parseFloat(String(p.bonus)),negative=n<0;
 if(!Number.isFinite(n))return {text:'تغيير في '+name+'؛ راجع النص الأصلي تحت.',review:false};
 if(flags[p.name]&&n===1&&!p.upgrade_type)return {text:flags[p.name],review:true};
 if(p.name==='AbilityCharges'&&Number(meta.value)===0&&n>1)return {text:'يفتح نظام الشحنات وتصير للقدرة '+fmt(n)+' شحنات.',review:true};
 if(ability.class_name==='citadel_ability_chrono_time_wall'&&p.name==='DebuffDuration')return {text:'العدو اللي يلمس الجدار يجيه سايلنس لمدة '+amount(n,'s')+'.',review:true};
 if(p.name==='CountsAsLightMelee'&&n===-1)return {text:'الضربة ما عادت تُحسب كميلي خفيف.',review:true};
 if(p.name==='MeleeDamage'&&n===0)return {text:'يتغير احتساب الضرر مع تحويل الضربة لميلي ثقيل.',review:true};
 let unit=unitOverrides[p.name]??meta.unit??'';if(meta.displayUnit==='EDisplayUnit_MetersPerSecond')unit='m/s';if(String(p.bonus).endsWith('m')&&!unit)unit='m';
 const baseName=name;
 if(p.upgrade_type==='EAddToScale'){if(!p.scale_stat_filter&&['DamageHeavyMelee','HeavyMeleeDamage'].includes(p.name))return {text:'الضربة تستفيد من '+fmt(n*100)+'% من ضرر الميلي الثقيل.',review:true};const stat={ETechPower:'نقطة سبيرت',EWeaponPower:'نقطة قوة سلاح',EBaseWeaponDamageIncrease:'نقطة زيادة ضرر سلاح',ETechRange:'نقطة زيادة مدى القدرات',ELevelUpBoons:'بف مستوى',EMeleeDamage:'نقطة ضرر ميلي',ELightMeleeDamage:'نقطة ضرر ميلي خفيف',EHeavyMeleeDamage:'نقطة ضرر ميلي ثقيل',EWeaponDamage:'نقطة ضرر سلاح',EMaxHealth:'نقطة من أقصى الصحة'}[p.scale_stat_filter]||'نقطة من الإحصائية المرتبطة';return {text:(negative?'يقل':'يزيد')+' معامل '+baseName+' بـ'+fmt(Math.abs(n))+' لكل '+stat+'.',review:true}}
 if(p.upgrade_type==='EMultiplyScale'){if(n===0)return {text:'يتوقف معامل الضرر السابق لأن الضربة تصير معتمدة على ضرر الميلي.',review:true};if(p.scale_stat_filter==='ETechPower'&&n>1)return {text:'تزيد استفادة '+baseName+' من السبيرت بـ'+fmt((n-1)*100)+'%.',review:true};return {text:'يتضاعف معامل استفادة '+baseName+' من الإحصائية المرتبطة ×'+fmt(n)+'.',review:true}}
 if(p.upgrade_type==='EMultiplyBase'&&ability.class_name==='ability_baba_hexing_brew')return {text:'يزيد '+baseName+' بـ'+fmt(n)+'% من قيمته الأساسية.',review:true};
 if(p.upgrade_type==='EMultiplyBase'&&ability.class_name==='citadel_ability_lash_down_strike')return {text:'يزيد '+baseName+' بـ'+fmt(n)+'% من قيمته الأساسية.',review:true};
 if(p.upgrade_type==='EMultiplyBase')return {text:'يتغير معامل القيمة الأساسية لـ'+baseName+' إلى '+fmt(n)+'، حسب بيانات اللعبة.',review:true};
 if(p.name==='MeleeLifesteal')return {text:'يرجع لك '+amount(Math.abs(n),'%')+' إضافية من ضرر الميلي كصحة.',review:true};
 if(p.name==='RegenIncomingDamagePercent')return {text:'تزيد نسبة الضرر اللي ترجع لك كصحة بـ'+amount(Math.abs(n),'%')+' إضافية.',review:true};
 if(p.name==='StatusResistancePercent')return {text:'تزيد مقاومة الديبف بـ'+amount(Math.abs(n),'%')+'؛ يعني مدة التأثيرات السلبية عليك تصير أقصر.',review:true};
 return {text:(negative?'يقل ':'يزيد ')+baseName+' بـ'+amount(Math.abs(n),unit)+'.',review:true};
}

Object.assign(upgradeNames,{
  "MaxDrawDistance": "أقصى طول للرسم",
  "BonusFireRatePerStack": "سرعة إطلاق إضافية لكل تكديس",
  "BulletDamageMultiplier": "زيادة ضرر الرصاص",
  "CooldownReductionPerHit": "تقليل الانتظار مع كل إصابة",
  "GroundAuraDuration": "مدة مسار الحبر",
  "TechPower": "قوة السبيرت",
  "DestroyOnDamage": "تكسّر الحبر عند تفعيل ضرره",
  "PullDistance": "مسافة سحب الخصم",
  "MeleeResist": "مقاومة الميلي",
  "BrewEffectiveness": "قوة تأثير الشاي",
  "DamagePerSecond": "ضرر الحرق كل ثانية",
  "SpiritResistReduction": "تقليل مقاومة السبيرت",
  "MaxSlow": "أقصى تبطيء",
  "BarrageMaxDamage": "أقصى ضرر لهجوم الحمام",
  "DrawDuration": "مدة بقاء الرسم",
  "MinDamage": "أقل ضرر",
  "BuildUpPerAbility": "التقدم مع كل قدرة",
  "BuildUpPerSecond": "التقدم كل ثانية",
  "TickInterval": "الوقت بين ضربات الضرر",
  "OutgoingDamagePercentPerPickup": "زيادة الضرر لكل رسمة",
  "IncomingDamagePercentReductionPerPickup": "تقليل الضرر المستقبَل لكل رسمة",
  "SpiritPerPickup": "السبيرت لكل رسمة",
  "GroveRadius": "نصف قطر دائرة الحبر",
  "ExplodeTime": "تأخير الانفجار",
  "StolenSpiritEffectiveness": "قوة الاستفادة من السبيرت المسروق",
  "ExplodeTimeInterval": "الوقت بين الانفجارات",
  "TechPowerGain": "السبيرت المسروق لكل إصابة",
  "HeavyMeleeSpiritDamage": "ضرر سبيرت الميلي الثقيل",
  "HeavyMeleeSlowPercent": "تبطيء الميلي الثقيل",
  "HeavyMeleeSlowDuration": "مدة تبطيء الميلي الثقيل",
  "LightKickKnockbackDistance": "مسافة دفع رفسة الميلي الخفيف",
  "GroundPoundKnockUpDuration": "مدة رفع ضربة الأرض",
  "BonusMeleeRange": "مدى ميلي إضافي",
  "MinJumpHeight": "ارتفاع القفزة",
  "MaxJumpHeight": "ارتفاع القفزة المشحونة بالكامل",
  "BrewTime": "وقت التحضير الأولي للشاي",
  "TimeToGainLockonStack": "وقت تثبيت كل حمامة على الهدف",
  "MaxLockonStacks": "أقصى حمام لكل هدف",
  "TimeToMaxStacks": "وقت الوصول لأقصى تكديس",
  "TickDamageIncreasePerHit": "زيادة الضرر مع كل ضربة"
});
