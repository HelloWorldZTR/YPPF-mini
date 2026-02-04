<script lang="ts" setup>
import type { Feedback, FeedbackCreate, FeedbackType, PatchedFeedbackUpdate } from '@/api/types/feedback'
import { nextTick, watch } from 'vue'
import {
  createFeedback,
  getFeedback,
  getFeedbackTypes,
  partialUpdateFeedback,
} from '@/api/feedback'

interface Props {
  /** 编辑的草稿数据，如果提供则进入编辑模式 */
  draft?: Feedback | null
}

interface Emits {
  (e: 'close'): void
  (e: 'success', data: { isDraft: boolean, feedback: Feedback }): void
}

const props = withDefaults(defineProps<Props>(), {
  draft: null,
})

const emit = defineEmits<Emits>()

// 表单状态
const formTypeId = ref<string | number>('')
const formTitle = ref('')
const formContent = ref('')
const formPublisherPublic = ref(true) // 是否公开，默认公开
const formSubmitting = ref(false)
const formOrgType = ref('学生会')
const formOrg = ref('内联权益部')

// 反馈类型
const feedbackTypes = ref<FeedbackType[]>([])

// 反馈类型选项（与网页一致，接口无数据时使用）
const FEEDBACK_TYPE_OPTIONS: FeedbackType[] = [
  { id: '35楼生活权益反馈', name: '35楼生活权益反馈' },
  { id: '地下室预约问题反馈', name: '地下室预约问题反馈' },
  { id: '智慧书院系统反馈', name: '智慧书院系统反馈' },
  { id: '团校反馈', name: '团校反馈' },
  { id: '学生会工作反馈', name: '学生会工作反馈' },
  { id: '通识课反馈', name: '通识课反馈' },
  { id: '学术问题/培养方案反馈', name: '学术问题/培养方案反馈' },
  { id: '书院课程反馈', name: '书院课程反馈' },
  { id: '校内权益问题反馈', name: '校内权益问题反馈' },
  { id: '其他反馈', name: '其他反馈' },
]

// 接收小组类型（与网页一致）
const orgTypeOptions = [
  { value: '书院俱乐部', label: '书院俱乐部' },
  { value: '书院课程', label: '书院课程' },
  { value: '体育队', label: '体育队' },
  { value: '元培学院', label: '元培学院' },
  { value: '团委', label: '团委' },
  { value: '学学学委员会', label: '学学学委员会' },
  { value: '学学学学会', label: '学学学学会' },
  { value: '学生会', label: '学生会' },
  { value: '学生小组', label: '学生小组' },
]

// 接收小组（按类型联动，与网页一致，完整列表）
const orgByType: Record<string, { value: string, label: string }[]> = {
  书院俱乐部: [
    { value: '元培地下电影院', label: '元培地下电影院' },
    { value: '学生设计组', label: '学生设计组' },
    { value: '何善衡图书室', label: '何善衡图书室' },
    { value: '元培音音音', label: '元培音音音' },
    { value: '元培吃吃吃', label: '元培吃吃吃' },
    { value: '智慧书院项目组', label: '智慧书院项目组' },
    { value: '元培拍拍拍', label: '元培拍拍拍' },
    { value: '书院健身俱乐部', label: '书院健身俱乐部' },
    { value: '35楼的住宿辅导员们', label: '35楼的住宿辅导员们' },
    { value: '元培桌桌桌', label: '元培桌桌桌' },
    { value: '元气咖啡厅', label: '元气咖啡厅' },
    { value: '元气人生编辑部', label: '元气人生编辑部' },
    { value: '元声室内合唱团YACC', label: '元声室内合唱团YACC' },
    { value: '党员先锋服务队', label: '党员先锋服务队' },
    { value: '元培排球', label: '元培排球' },
    { value: '元培辩论队', label: '元培辩论队' },
  ],
  书院课程: [
    { value: '书院粤语班', label: '书院粤语班' },
    { value: '书院摄影课（基础）', label: '书院摄影课（基础）' },
    { value: '35元设计实验室', label: '35元设计实验室' },
    { value: '舞蹈课—女团舞', label: '舞蹈课—女团舞' },
    { value: '探索"关系"', label: '探索"关系"' },
    { value: '元行传薪', label: '元行传薪' },
    { value: '红色溯源系列课程', label: '红色溯源系列课程' },
    { value: '红色溯源系列课程之党史学习', label: '红色溯源系列课程之党史学习' },
    { value: '红色溯源系列课程之经典研读', label: '红色溯源系列课程之经典研读' },
    { value: '元智乐弈', label: '元智乐弈' },
    { value: '职业素养提升', label: '职业素养提升' },
    { value: '国际品牌传播', label: '国际品牌传播' },
    { value: '学业与人生', label: '学业与人生' },
    { value: '读书会', label: '读书会' },
    { value: '129合唱', label: '129合唱' },
    { value: '辩论思维与公共表达', label: '辩论思维与公共表达' },
    { value: '中国手语入门', label: '中国手语入门' },
    { value: '《大教堂与集市》读书会', label: '《大教堂与集市》读书会' },
    { value: '慢投垒球', label: '慢投垒球' },
    { value: '书院羽毛球课', label: '书院羽毛球课' },
    { value: '书院排球课', label: '书院排球课' },
    { value: '定向运动兴趣课', label: '定向运动兴趣课' },
    { value: '书院健身课', label: '书院健身课' },
    { value: '"元培跑跑跑"跑团', label: '"元培跑跑跑"跑团' },
    { value: '书院篮球课', label: '书院篮球课' },
    { value: '燃脂塑形课', label: '燃脂塑形课' },
    { value: '书院乒乓球课', label: '书院乒乓球课' },
    { value: '书法基础实践与艺术鉴赏', label: '书法基础实践与艺术鉴赏' },
    { value: '篆刻基础实践与艺术鉴赏', label: '篆刻基础实践与艺术鉴赏' },
    { value: '古琴工作坊', label: '古琴工作坊' },
    { value: '国画基础实践与艺术鉴赏', label: '国画基础实践与艺术鉴赏' },
    { value: '绘画班', label: '绘画班' },
    { value: '手工课', label: '手工课' },
    { value: '生活技能课', label: '生活技能课' },
    { value: '极客创意动手实践课', label: '极客创意动手实践课' },
    { value: '"元plus"技能培训讲座', label: '"元plus"技能培训讲座' },
    { value: '元行力行', label: '元行力行' },
    { value: '戏剧课', label: '戏剧课' },
    { value: '中国艺术歌曲演唱与演奏', label: '中国艺术歌曲演唱与演奏' },
    { value: '大讲堂音乐课堂—轻松歌唱', label: '大讲堂音乐课堂—轻松歌唱' },
    { value: '扬琴工作坊', label: '扬琴工作坊' },
    { value: '城市生物多样性调查保护：从燕园开始', label: '城市生物多样性调查保护：从燕园开始' },
    { value: '航模制作与前庭功能提高', label: '航模制作与前庭功能提高' },
    { value: '无人机制作', label: '无人机制作' },
    { value: '影视制作', label: '影视制作' },
    { value: '我的家乡', label: '我的家乡' },
    { value: '网球课', label: '网球课' },
    { value: '书院台球课', label: '书院台球课' },
    { value: '足球课', label: '足球课' },
    { value: '标准日语', label: '标准日语' },
    { value: '学业规划课', label: '学业规划课' },
    { value: '健身基础班（男）', label: '健身基础班（男）' },
    { value: '健身提高班（男）', label: '健身提高班（男）' },
    { value: '健身基础班（女）', label: '健身基础班（女）' },
    { value: '健身提高班', label: '健身提高班' },
    { value: '篮球男生班', label: '篮球男生班' },
    { value: '篮球女生班', label: '篮球女生班' },
    { value: '书院台球课2班', label: '书院台球课2班' },
    { value: '棒垒', label: '棒垒' },
    { value: '网球', label: '网球' },
    { value: '足球', label: '足球' },
    { value: '从零制作无人机', label: '从零制作无人机' },
    { value: '羽毛球', label: '羽毛球' },
    { value: '排球', label: '排球' },
    { value: '大讲堂音乐课堂-轻松歌唱', label: '大讲堂音乐课堂-轻松歌唱' },
    { value: '元气咖咖咖——咖啡知识、冲调与品鉴', label: '元气咖咖咖——咖啡知识、冲调与品鉴' },
    { value: '北京的交通与城市探索', label: '北京的交通与城市探索' },
    { value: '航模制作与前庭功能提高课', label: '航模制作与前庭功能提高课' },
    { value: '台球', label: '台球' },
    { value: '舞蹈课-女团舞', label: '舞蹈课-女团舞' },
    { value: '红色溯源系列课程之实践探索', label: '红色溯源系列课程之实践探索' },
    { value: '粤语课', label: '粤语课' },
    { value: '乒乓球', label: '乒乓球' },
    { value: '岩之言：认识矿物与化石', label: '岩之言：认识矿物与化石' },
    { value: '编织基础', label: '编织基础' },
    { value: '劳动生活技能课', label: '劳动生活技能课' },
    { value: '北京历史地理文化导读', label: '北京历史地理文化导读' },
    { value: '动漫绘画实践', label: '动漫绘画实践' },
    { value: '元桌会友', label: '元桌会友' },
    { value: '公共表达与实用沟通', label: '公共表达与实用沟通' },
    { value: '品牌运营实操分享', label: '品牌运营实操分享' },
    { value: '从红色燕园到寰宇形势', label: '从红色燕园到寰宇形势' },
    { value: '爱乐传习', label: '爱乐传习' },
    { value: '成长探索', label: '成长探索' },
    { value: '读书会（社科）', label: '读书会（社科）' },
    { value: '篮球课（女）', label: '篮球课（女）' },
    { value: '篮球基础班（男）', label: '篮球基础班（男）' },
    { value: '篮球提高班（男）', label: '篮球提高班（男）' },
    { value: '创新空间设计', label: '创新空间设计' },
    { value: '历史城市与文化遗产', label: '历史城市与文化遗产' },
    { value: '法国新浪潮电影的源与流', label: '法国新浪潮电影的源与流' },
    { value: '纪录片大师课', label: '纪录片大师课' },
    { value: '23秋辩论思维与公共表达', label: '23秋辩论思维与公共表达' },
    { value: '留学生汉语写作', label: '留学生汉语写作' },
    { value: '探索成长', label: '探索成长' },
    { value: '北京历史地理与红色文化', label: '北京历史地理与红色文化' },
    { value: '中国传统文化初探与德育教育实践', label: '中国传统文化初探与德育教育实践' },
    { value: '漫步人生', label: '漫步人生' },
    { value: '3D打印-建模与实践', label: '3D打印-建模与实践' },
    { value: '劳动类课程', label: '劳动类课程' },
    { value: '互联网产品创新设计', label: '互联网产品创新设计' },
    { value: '舞蹈美育系列课程', label: '舞蹈美育系列课程' },
    { value: '生活实践课', label: '生活实践课' },
    { value: '导演创作基本原理与技能', label: '导演创作基本原理与技能' },
    { value: '即兴的魅力', label: '即兴的魅力' },
    { value: '神奇动物在哪里？古代近东神怪信仰与图像', label: '神奇动物在哪里？古代近东神怪信仰与图像' },
    { value: '书院实践之旅', label: '书院实践之旅' },
    { value: 'PPE读书会（《史记》）', label: 'PPE读书会（《史记》）' },
    { value: '阅读与汇报', label: '阅读与汇报' },
    { value: '心晴读书会', label: '心晴读书会' },
    { value: '校园风景速写', label: '校园风景速写' },
    { value: 'PPE读书会', label: 'PPE读书会' },
    { value: '昆曲课', label: '昆曲课' },
    { value: '视觉艺术自由表达', label: '视觉艺术自由表达' },
    { value: '航模制造入门', label: '航模制造入门' },
    { value: '古典舞', label: '古典舞' },
    { value: '书院辩论课', label: '书院辩论课' },
    { value: '颗粒艺术', label: '颗粒艺术' },
    { value: '从零开始：健身训练与营养指南', label: '从零开始：健身训练与营养指南' },
    { value: '西装与美妆-西装搭配与化妆知识导论', label: '西装与美妆-西装搭配与化妆知识导论' },
    { value: '飞盘书院课', label: '飞盘书院课' },
    { value: '西装与美妆-绅装搭配与化妆知识导论', label: '西装与美妆-绅装搭配与化妆知识导论' },
    { value: '心引力', label: '心引力' },
    { value: '辩论方法与实践', label: '辩论方法与实践' },
    { value: '古琴艺术与演奏实践', label: '古琴艺术与演奏实践' },
    { value: '味来实验室', label: '味来实验室' },
  ],
  体育队: [
    { value: '元培男篮', label: '元培男篮' },
    { value: '元培女篮', label: '元培女篮' },
    { value: '元培男足', label: '元培男足' },
    { value: '元培女足', label: '元培女足' },
    { value: '元培男排', label: '元培男排' },
    { value: '元培女排', label: '元培女排' },
    { value: '元培网球队', label: '元培网球队' },
    { value: '元培羽毛球队', label: '元培羽毛球队' },
    { value: '元培台球队', label: '元培台球队' },
    { value: '元培乒乓球队', label: '元培乒乓球队' },
    { value: '元培慢垒', label: '元培慢垒' },
    { value: '元培飞盘队', label: '元培飞盘队' },
  ],
  元培学院: [
    { value: '元培学院', label: '元培学院' },
    { value: '元气值中心', label: '元气值中心' },
    { value: '元培书院', label: '元培书院' },
    { value: '物业中心', label: '物业中心' },
  ],
  团委: [
    { value: '元培团委', label: '元培团委' },
    { value: '组织部', label: '组织部' },
    { value: '团校秘书处', label: '团校秘书处' },
    { value: '综合办公室', label: '综合办公室' },
    { value: '团委宣传部', label: '团委宣传部' },
    { value: '青年志愿者协会', label: '青年志愿者协会' },
    { value: '社会实践与学生团体部', label: '社会实践与学生团体部' },
    { value: '信息化部', label: '信息化部' },
    { value: '元培学院学生新闻中心', label: '元培学院学生新闻中心' },
    { value: '飞', label: '飞' },
  ],
  学学学委员会: [
    { value: '三学主席团', label: '三学主席团' },
    { value: '三学宣传部', label: '三学宣传部' },
    { value: '秘书处', label: '秘书处' },
    { value: '科研部', label: '科研部' },
    { value: '学术规划部', label: '学术规划部' },
  ],
  学学学学会: [
    { value: '信息数据智能学会', label: '信息数据智能学会' },
    { value: '政经哲学会', label: '政经哲学会' },
    { value: '经管学会', label: '经管学会' },
    { value: '物理学会', label: '物理学会' },
    { value: '数学学会', label: '数学学会' },
    { value: '整科学会', label: '整科学会' },
    { value: '法学学会', label: '法学学会' },
    { value: '生化学会', label: '生化学会' },
    { value: '社科学会', label: '社科学会' },
    { value: '人文学会', label: '人文学会' },
  ],
  学生会: [
    { value: '学生会主席团', label: '学生会主席团' },
    { value: '文娱生活部', label: '文娱生活部' },
    { value: '体育竞技部', label: '体育竞技部' },
    { value: '实践交流部', label: '实践交流部' },
    { value: '内联权益部', label: '内联权益部' },
    { value: '对外联络部', label: '对外联络部' },
    { value: '文宣策划部', label: '文宣策划部' },
    { value: '常代表', label: '常代表' },
  ],
  学生小组: [
    { value: '3楼最西', label: '3楼最西' },
    { value: '35楼的旅行者们', label: '35楼的旅行者们' },
    { value: '35.4', label: '35.4' },
    { value: '35楼三层324-336寝室', label: '35楼三层324-336寝室' },
    { value: 'DAI论文研讨小组', label: 'DAI论文研讨小组' },
    { value: '35楼红楼梦研究社', label: '35楼红楼梦研究社' },
    { value: 'A-SOUL同好会', label: 'A-SOUL同好会' },
    { value: '元气戏精团', label: '元气戏精团' },
    { value: '艾欧泽亚冒险者', label: '艾欧泽亚冒险者' },
    { value: 'Paradox Universalis', label: 'Paradox Universalis' },
    { value: '元培TRPG', label: '元培TRPG' },
    { value: '元培反卷卷', label: '元培反卷卷' },
    { value: '35楼的侦探?', label: '35楼的侦探?' },
    { value: '元培虚构作品与艺术语言小组', label: '元培虚构作品与艺术语言小组' },
    { value: '元培球球球', label: '元培球球球' },
    { value: '古典之声', label: '古典之声' },
    { value: '35楼一层西', label: '35楼一层西' },
    { value: '元气化(饮)学(料)实验室', label: '元气化(饮)学(料)实验室' },
    { value: '后近代非现实平面运动影像文化学术研究中心', label: '后近代非现实平面运动影像文化学术研究中心' },
    { value: '元培茶茶茶', label: '元培茶茶茶' },
    { value: '元培观观观', label: '元培观观观' },
    { value: '自学乐器（Just Play！）小组', label: '自学乐器（Just Play！）小组' },
    { value: '35楼的捍卫者们', label: '35楼的捍卫者们' },
    { value: '元培推理系游戏爱好者小组', label: '元培推理系游戏爱好者小组' },
    { value: '三道口研究院', label: '三道口研究院' },
    { value: '元培画画画儿', label: '元培画画画儿' },
    { value: '鹤鸣诗社', label: '鹤鸣诗社' },
    { value: '元培吨吨吨', label: '元培吨吨吨' },
    { value: '元培柚子世界品鉴社', label: '元培柚子世界品鉴社' },
    { value: 'Geist', label: 'Geist' },
    { value: '德法pre', label: '德法pre' },
    { value: 'ypc_Minecraft!', label: 'ypc_Minecraft!' },
    { value: '元培驻罗德岛博士点', label: '元培驻罗德岛博士点' },
    { value: ' YP 20 fourever', label: ' YP 20 fourever' },
    { value: '2020级2班', label: '2020级2班' },
    { value: '德法pre 🙏', label: '德法pre 🙏' },
    { value: '贰通乐园', label: '贰通乐园' },
    { value: 'MUUUUUU~SICAL', label: 'MUUUUUU~SICAL' },
    { value: '不严肃论文讨论会', label: '不严肃论文讨论会' },
    { value: '23秋民法总论第30组', label: '23秋民法总论第30组' },
    { value: '民法总论第27讨论组', label: '民法总论第27讨论组' },
    { value: 'Bonjour', label: 'Bonjour' },
    { value: 'RusPintos项目组', label: 'RusPintos项目组' },
    { value: 'TriRoll元三滚🎸', label: 'TriRoll元三滚🎸' },
    { value: '元培学院学生对元气值的使用情况调查', label: '元培学院学生对元气值的使用情况调查' },
  ],
}

// 反馈类型到接收小组类型的映射（与网页 change_org_type_and_org 一致）
const feedbackTypeToOrg: Record<string, { orgType: string, org: string }> = {
  '35楼生活权益反馈': { orgType: '学生会', org: '内联权益部' },
  '地下室预约问题反馈': { orgType: '书院俱乐部', org: '智慧书院项目组' },
  '智慧书院系统反馈': { orgType: '书院俱乐部', org: '智慧书院项目组' },
  '团校反馈': { orgType: '团委', org: '团校秘书处' },
  '学生会工作反馈': { orgType: '学生会', org: '' },
  '通识课反馈': { orgType: '学学学委员会', org: '秘书处' },
  '学术问题/培养方案反馈': { orgType: '学学学学会', org: '' },
  '书院课程反馈': { orgType: '书院课程', org: '' },
  '校内权益问题反馈': { orgType: '学生会', org: '常代表' },
  '其他反馈': { orgType: '', org: '' },
}

const orgOptions = computed(() => orgByType[formOrgType.value] ?? [])

// 反馈类型数组（用于 picker，确保是普通数组）
const feedbackTypesArray = computed(() => {
  return feedbackTypes.value.length > 0 ? feedbackTypes.value : FEEDBACK_TYPE_OPTIONS
})

// 反馈类型 picker 的索引（确保返回有效值）
const feedbackTypeIndex = computed(() => {
  const arr = feedbackTypesArray.value
  if (arr.length === 0)
    return 0
  const idx = arr.findIndex(t => t.id === formTypeId.value)
  return idx >= 0 ? idx : 0
})

watch(orgOptions, (options) => {
  const has = options.some(o => o.value === formOrg.value)
  if (options.length && !has)
    formOrg.value = options[0]?.value ?? ''
}, { immediate: true })

// 监听反馈类型变化，自动设置接收小组类型和接收小组
watch(formTypeId, (typeId) => {
  // 允许 id 为 0，只检查是否为 null/undefined/空字符串
  if (typeId === null || typeId === undefined || typeId === '')
    return
  const feedbackType = feedbackTypesArray.value.find(t => t.id === typeId)
  if (!feedbackType)
    return
  const mapping = feedbackTypeToOrg[feedbackType.name]
  if (mapping) {
    if (mapping.orgType) {
      formOrgType.value = mapping.orgType
      if (mapping.org) {
        // 等待 orgOptions 更新后再设置 org
        nextTick(() => {
          const orgExists = orgOptions.value.some(o => o.value === mapping.org)
          if (orgExists) {
            formOrg.value = mapping.org
          }
        })
      }
    }
  }
})

// 加载反馈类型
async function loadTypes() {
  try {
    const res = await getFeedbackTypes()
    if (res && res.length > 0) {
      feedbackTypes.value = res
      // 只有当 formTypeId 为 null/undefined/空字符串时才设置默认值（允许 id 为 0）
      if (feedbackTypes.value.length && (formTypeId.value === null || formTypeId.value === undefined || formTypeId.value === '')) {
        formTypeId.value = feedbackTypes.value[0].id
      }
    }
  }
  catch (e) {
    console.error('加载反馈类型失败', e)
  }
}

// 初始化表单数据（编辑模式）
async function initFormData() {
  if (props.draft) {
    try {
      // 获取完整的草稿数据
      const fullDraft = await getFeedback(props.draft.id)
      console.log('加载草稿数据:', fullDraft)

      // 填充表单数据
      formTitle.value = fullDraft.title || ''
      formContent.value = fullDraft.content || ''
      formPublisherPublic.value = fullDraft.publisher_public ?? true

      // 设置反馈类型
      const typeName = fullDraft.type_name || fullDraft.feedback_type_display
      if (typeName) {
        const type = feedbackTypesArray.value.find(t => t.name === typeName)
        if (type) {
          formTypeId.value = type.id
          console.log('设置反馈类型:', typeName, 'ID:', type.id)
        }
        else {
          console.warn('未找到反馈类型:', typeName)
          // 如果找不到，使用第一个作为默认值
          if (feedbackTypesArray.value.length > 0) {
            formTypeId.value = feedbackTypesArray.value[0].id
          }
        }
      }

      // 设置接收小组类型和接收小组
      if (fullDraft.org_type_name) {
        formOrgType.value = fullDraft.org_type_name
        // 等待 orgOptions 更新后再设置 org
        await nextTick()
        if (fullDraft.org_name) {
          const orgExists = orgOptions.value.some(o => o.value === fullDraft.org_name)
          if (orgExists) {
            formOrg.value = fullDraft.org_name
          }
          else {
            console.warn('接收小组不存在于选项中:', fullDraft.org_name)
          }
        }
      }
      else {
        // 如果没有 org_type_name，使用默认值
        formOrgType.value = '学生会'
        await nextTick()
        formOrg.value = '内联权益部'
      }
    }
    catch (e) {
      console.error('加载草稿失败', e)
      uni.showToast({ title: '加载草稿失败', icon: 'none' })
    }
  }
  else {
    // 新建模式：重置表单
    formTitle.value = ''
    formContent.value = ''
    formPublisherPublic.value = true
    formOrgType.value = '学生会'
    formOrg.value = '内联权益部'

    // 确保 formTypeId 有值（允许 id 为 0）
    if ((formTypeId.value === null || formTypeId.value === undefined || formTypeId.value === '') && feedbackTypesArray.value.length > 0) {
      formTypeId.value = feedbackTypesArray.value[0].id
    }
  }
}

// 监听 draft prop 变化，重新初始化表单
watch(() => props.draft, async () => {
  await initFormData()
}, { immediate: true })

function handleFeedbackTypeChange(e: any) {
  const index = e.detail.value
  const arr = feedbackTypesArray.value
  if (arr && arr[index] && arr[index].id !== undefined) {
    formTypeId.value = arr[index].id
  }
}

function handlePublisherPublicChange(e: any) {
  // uni-app switch 组件的 e.detail.value 是布尔值
  formPublisherPublic.value = e.detail.value === true || e.detail.value === 'true' || e.detail.value === 1
}

async function submitFeedback(asDraft: boolean) {
  const typeId = formTypeId.value
  const title = formTitle.value.trim()
  const body = formContent.value.trim()
  // 允许 id 为 0，只检查是否为 null/undefined/空字符串
  if (typeId === null || typeId === undefined || typeId === '') {
    uni.showToast({ title: '请选择反馈类型', icon: 'none' })
    return
  }
  if (!asDraft && !body) {
    uni.showToast({ title: '请填写反馈内容', icon: 'none' })
    return
  }
  if (title.length > 25) {
    uni.showToast({ title: '标题不能超过25字符', icon: 'none' })
    return
  }
  // 标题和内容分开传（后端要求）
  const finalTitle = title || (asDraft ? '(草稿)' : '')
  const finalContent = body || (asDraft ? '(草稿)' : '')

  try {
    formSubmitting.value = true
    // 获取选中的反馈类型对象，确保使用正确的 id
    const selectedType = feedbackTypesArray.value.find(t => t.id === typeId)
    if (!selectedType) {
      uni.showToast({ title: '请选择有效的反馈类型', icon: 'none' })
      formSubmitting.value = false
      return
    }

    // 根据错误"数据库没有对应反馈类型"，统一传 name 字段
    const typeValue = selectedType.name

    let result: Feedback
    if (props.draft) {
      // 编辑草稿：使用 PATCH 更新
      const updatePayload: PatchedFeedbackUpdate = {
        type: typeValue,
        title: finalTitle,
        content: finalContent,
        otype: formOrgType.value && formOrgType.value.trim() ? formOrgType.value.trim() : undefined,
        org: formOrg.value && formOrg.value.trim() ? formOrg.value.trim() : undefined,
        publisher_public: formPublisherPublic.value,
        post_type: asDraft ? 'modify' : 'submit_draft', // modify=修改，submit_draft=提交草稿
      }
      result = await partialUpdateFeedback(props.draft.id, updatePayload)
      console.log('更新草稿成功，返回数据:', result)
    }
    else {
      // 新建反馈：使用 POST 创建
      const payload: FeedbackCreate = {
        type: typeValue,
        title: finalTitle,
        content: finalContent,
        post_type: asDraft ? 'save' : 'directly_submit',
        publisher_public: formPublisherPublic.value,
      }

      // 接收小组类型和接收小组：保存草稿时可以为空，直接提交时必填
      if (formOrgType.value && formOrgType.value.trim()) {
        payload.otype = formOrgType.value.trim()
      }
      if (formOrg.value && formOrg.value.trim()) {
        payload.org = formOrg.value.trim()
      }

      result = await createFeedback(payload)
      console.log('创建反馈成功，返回数据:', result)
    }

    console.log('返回的 issue_status:', result.issue_status, '期望:', asDraft ? 0 : 1)

    // 验证后端返回的状态是否正确
    if (asDraft && result.issue_status !== 0) {
      console.error('❌ 错误：保存草稿时，后端返回的 issue_status 不是 0，而是', result.issue_status)
      uni.showToast({
        title: `草稿保存失败（状态异常：${result.issue_status_display || result.issue_status}）`,
        icon: 'none',
        duration: 3000,
      })
      formSubmitting.value = false
      return
    }
    else if (!asDraft && result.issue_status !== 1) {
      console.error('❌ 错误：提交反馈时，后端返回的 issue_status 不是 1，而是', result.issue_status)
    }

    uni.showToast({ title: asDraft ? '草稿已保存' : '提交成功', icon: 'success' })

    // 通知父组件
    emit('success', { isDraft: asDraft, feedback: result })

    // 如果不是草稿，关闭表单
    if (!asDraft) {
      emit('close')
    }
  }
  catch (e: any) {
    console.error('提交失败', e)
    const errorMsg = e?.response?.data?.detail || e?.message || '提交失败，请重试'
    uni.showToast({ title: errorMsg, icon: 'none', duration: 3000 })
  }
  finally {
    formSubmitting.value = false
  }
}

function handleClose() {
  emit('close')
}

// 组件挂载时加载反馈类型
onMounted(async () => {
  await loadTypes()
  await initFormData()
})
</script>

<template>
  <view class="feedback-form-screen">
    <view class="feedback-form-header">
      <view class="feedback-form-header-side" hover-class="none" @click="handleClose">
        <text class="i-carbon-arrow-left text-xl text-[#1b55e2]" />
      </view>
      <text class="feedback-form-title">{{ draft ? '编辑草稿' : '反馈详情' }}</text>
      <view class="feedback-form-header-side feedback-form-header-right">
        <text class="text-sm text-[#424344] underline">匿名</text>
      </view>
    </view>
    <scroll-view scroll-y class="feedback-form-scroll" :show-scrollbar="false">
      <view class="feedback-form-body">
        <!-- 反馈类型 -->
        <view class="form-group mb-4">
          <text class="mb-2 block text-sm text-[#424344] font-medium">反馈类型</text>
          <picker
            :value="feedbackTypeIndex"
            :range="feedbackTypesArray"
            range-key="name"
            class="form-picker"
            @change="handleFeedbackTypeChange"
          >
            <view class="form-picker-inner">
              <text class="form-picker-text ellipsis">{{ feedbackTypesArray.find(t => t.id === formTypeId)?.name ?? '请选择反馈类型' }}</text>
              <text class="i-carbon-chevron-down form-picker-arrow" />
            </view>
          </picker>
        </view>
        <!-- 反馈标题 -->
        <view class="form-group mb-4">
          <text class="mb-2 block text-sm text-[#424344] font-medium">反馈标题</text>
          <textarea
            v-model="formTitle"
            class="form-textarea"
            placeholder="标题不能超过25字符噢！"
            :maxlength="25"
            show-confirm-bar
          />
          <text class="mt-2 block text-xs text-[#424344] font-bold">请文明理性发言，共同营造良好的网络环境！</text>
        </view>
        <!-- 接收小组类型 -->
        <view class="form-group mb-4">
          <text class="mb-2 block text-sm text-[#424344] font-medium">接收小组类型</text>
          <picker
            :value="orgTypeOptions.findIndex(o => o.value === formOrgType)"
            :range="orgTypeOptions"
            range-key="label"
            class="form-picker"
            @change="(e: any) => { formOrgType = orgTypeOptions[e.detail.value]?.value ?? '' }"
          >
            <view class="form-picker-inner">
              <text class="form-picker-text ellipsis">{{ formOrgType || '请选择' }}</text>
              <text class="i-carbon-chevron-down form-picker-arrow" />
            </view>
          </picker>
        </view>
        <!-- 接收小组 -->
        <view class="form-group mb-4">
          <text class="mb-2 block text-sm text-[#424344] font-medium">接收小组</text>
          <picker
            :value="orgOptions.findIndex(o => o.value === formOrg)"
            :range="orgOptions"
            range-key="label"
            class="form-picker"
            @change="(e: any) => { formOrg = orgOptions[e.detail.value]?.value ?? '' }"
          >
            <view class="form-picker-inner">
              <text class="form-picker-text ellipsis">{{ formOrg || '请选择' }}</text>
              <text class="i-carbon-chevron-down form-picker-arrow" />
            </view>
          </picker>
        </view>
        <!-- 反馈内容 -->
        <view class="form-group mb-4">
          <text class="mb-2 block text-sm text-[#424344] font-medium">反馈内容</text>
          <textarea
            v-model="formContent"
            class="form-textarea form-textarea-large"
            placeholder="请描述您的问题或建议..."
            :maxlength="500"
            show-confirm-bar
          />
          <view class="mt-1 text-right text-xs text-gray-400">
            {{ formContent.length }}/500
          </view>
        </view>
        <!-- 是否公开 -->
        <view class="form-group mb-4 flex items-center">
          <switch
            :checked="formPublisherPublic"
            color="#1b55e2"
            @change="handlePublisherPublicChange"
          />
          <text class="ml-3 text-sm text-[#424344]">公开反馈（展示在公示栏，为后来者提供帮助）</text>
        </view>
        <!-- 按钮：适配屏宽、禁用默认点击高亮防闪屏 -->
        <view class="form-buttons">
          <view
            class="form-btn form-btn-secondary"
            :class="{ 'form-btn-disabled': formSubmitting }"
            hover-class="none"
            @click="!formSubmitting && submitFeedback(true)"
          >
            <text>保存草稿</text>
          </view>
          <view
            class="form-btn form-btn-primary"
            :class="{ 'form-btn-disabled': formSubmitting }"
            hover-class="none"
            @click="!formSubmitting && submitFeedback(false)"
          >
            <text>提交反馈</text>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<style lang="scss" scoped>
.feedback-form-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  background: #f8f9fa;
  display: flex;
  flex-direction: column;
}

.feedback-form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.feedback-form-header-side {
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.feedback-form-header-right {
  justify-content: flex-end;
}

.feedback-form-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  color: #1b55e2;
}

.feedback-form-scroll {
  flex: 1;
  overflow-y: auto;
}

.feedback-form-body {
  padding: 16px;
  padding-bottom: 100px;
}

.form-group {
  margin-bottom: 16px;
}

.form-picker {
  width: 100%;
}

.form-picker-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.form-picker-text {
  flex: 1;
  font-size: 14px;
  color: #424344;
}

.form-picker-arrow {
  font-size: 16px;
  color: #9ca3af;
}

.form-textarea {
  width: 100%;
  min-height: 80px;
  padding: 12px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #424344;
  box-sizing: border-box;
}

.form-textarea-large {
  min-height: 120px;
}

.form-buttons {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  margin-bottom: 20px;
  width: 100%;
}

.form-btn {
  flex: 1;
  padding: 8px 16px;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  min-height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-btn-primary {
  background-color: #1b55e2 !important;
  color: white !important;
}

.form-btn-secondary {
  background-color: white !important;
  color: #1b55e2 !important;
  border: 1px solid #1b55e2 !important;
}

.form-btn-disabled {
  opacity: 0.5;
  pointer-events: none;
}

.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
