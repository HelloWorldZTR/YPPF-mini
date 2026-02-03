<script lang="ts" setup>
import type { IViolationAppoint } from '@/api/types/appoint'
import type { Feedback, FeedbackCreate, FeedbackType, SolveStatus } from '@/api/types/feedback'
import { getMyViolations } from '@/api/appoint'
import {
  createFeedback,
  getFeedbackTypes,
  listFeedback,
} from '@/api/feedback'

definePage({
  style: {
    navigationBarTitleText: '问答反馈中心',
    navigationBarBackgroundColor: '#1b55e2',
    navigationBarTextStyle: 'white',
  },
})

// 列表视图 / 写反馈表单
const showCreateForm = ref(false)

const feedbackTypes = ref<FeedbackType[]>([])
const list = ref<Feedback[]>([])
const listLoading = ref(false)

// 我的反馈：草稿箱 / 进行中 / 已结束
const myFeedbackTab = ref<'draft' | 'inProgress' | 'done'>('inProgress')
const myDraftList = ref<Feedback[]>([])
const myInProgressList = ref<Feedback[]>([])
const myDoneList = ref<Feedback[]>([])
const myListLoading = ref(false)

const formTypeId = ref<string | number>('')
const formTitle = ref('')
const formContent = ref('')
const formSubmitting = ref(false)

/** 是否从申诉入口进入：锁定标题为「预约申诉(aid)」不可修改 */
const isAppealFromAid = ref(false)

/** 申诉相关：地下室预约问题反馈类型 id，用于匹配已有申诉 */
const APPEAL_TYPE_ID = '地下室预约问题反馈'
/** 申诉标题格式，用于查找已有申诉及锁定展示 */
function appealTitle(aid: number) {
  return `预约申诉(${aid})`
}

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
// 接收小组（按类型联动，与网页一致）
const orgByType: Record<string, { value: string, label: string }[]> = {
  书院俱乐部: [{ value: '书院俱乐部', label: '书院俱乐部' }],
  书院课程: [{ value: '书院课程', label: '书院课程' }],
  体育队: [{ value: '体育队', label: '体育队' }],
  元培学院: [{ value: '元培学院', label: '元培学院' }],
  团委: [{ value: '团委', label: '团委' }],
  学学学委员会: [{ value: '学学学委员会', label: '学学学委员会' }],
  学学学学会: [{ value: '学学学学会', label: '学学学学会' }],
  学生会: [
    { value: '学生会主席团', label: '学生会主席团' },
    { value: '文娱生活部', label: '文娱生活部' },
    { value: '体育竞技部', label: '体育竞技部' },
    { value: '实践交流部', label: '实践交流部' },
    { value: '内联权益部', label: '内联权益部' },
    { value: '对外联络部', label: '对外联络部' },
    { value: '文宣策划部', label: '文宣策划部' },
  ],
  学生小组: [{ value: '学生小组', label: '学生小组' }],
}
const formOrgType = ref('学生会')
const formOrg = ref('内联权益部')

const orgOptions = computed(() => orgByType[formOrgType.value] ?? [])

watch(orgOptions, (options) => {
  const has = options.some(o => o.value === formOrg.value)
  if (options.length && !has)
    formOrg.value = options[0].value
}, { immediate: true })

// 公示栏：只拉已发布的反馈，按时间倒序
async function loadList() {
  try {
    listLoading.value = true
    list.value = await listFeedback({
      issue_status: 1,
      ordering: '-feedback_time',
    })
  }
  catch (e) {
    console.error('加载列表失败', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
  finally {
    listLoading.value = false
  }
}

// 我的反馈：草稿箱、进行中、已结束
async function loadMyFeedback() {
  try {
    myListLoading.value = true
    const [draftRes, publishedRes] = await Promise.all([
      listFeedback({ issue_status: 0, ordering: '-modify_time' }),
      listFeedback({ issue_status: 1, ordering: '-feedback_time' }),
    ])
    myDraftList.value = draftRes
    myInProgressList.value = publishedRes.filter(i => i.solve_status === 0 || i.solve_status === 1)
    myDoneList.value = publishedRes.filter(i => i.solve_status === 2 || i.solve_status === 3)
  }
  catch (e) {
    console.error('加载我的反馈失败', e)
    uni.showToast({ title: '加载失败', icon: 'none' })
  }
  finally {
    myListLoading.value = false
  }
}

function setMyFeedbackTab(tab: 'draft' | 'inProgress' | 'done') {
  myFeedbackTab.value = tab
}

async function loadTypes() {
  try {
    const apiTypes = await getFeedbackTypes()
    feedbackTypes.value = apiTypes.length > 0 ? apiTypes : FEEDBACK_TYPE_OPTIONS
    if (feedbackTypes.value.length && !formTypeId.value)
      formTypeId.value = feedbackTypes.value[0].id
  }
  catch (e) {
    console.error('加载反馈类型失败', e)
    feedbackTypes.value = FEEDBACK_TYPE_OPTIONS
    if (!formTypeId.value)
      formTypeId.value = FEEDBACK_TYPE_OPTIONS[0].id
  }
}

// 网页版日期格式：2024年5月17日 16:50 公开
function formatDatePublic(time: string | undefined) {
  if (!time)
    return '— 公开'
  const d = new Date(time)
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const day = d.getDate()
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}年${m}月${day}日 ${h}:${min} 公开`
}

// 解决状态文案与样式（与网页一致：已解决=绿，无法解决=蓝）
function solveStatusInfo(status: SolveStatus): { text: string, class: string } {
  switch (status) {
    case 2:
      return { text: '已解决', class: 'badge-success' }
    case 3:
      return { text: '无法解决', class: 'badge-primary' }
    case 1:
      return { text: '处理中', class: 'badge-warning' }
    default:
      return { text: '待处理', class: 'badge-secondary' }
  }
}

// 列表项标题：取内容前 20 字或首行
function cardTitle(item: Feedback): string {
  const c = item.content?.trim() || ''
  if (!c)
    return '（无标题）'
  const firstLine = c.split('\n')[0].trim()
  return firstLine.length > 20 ? `${firstLine.slice(0, 20)}…` : firstLine
}

function goCreate() {
  isAppealFromAid.value = false
  formTitle.value = ''
  loadTypes()
  showCreateForm.value = true
}

function backToList() {
  showCreateForm.value = false
  isAppealFromAid.value = false
  formTitle.value = ''
  loadList()
}

/** 根据违规记录生成申诉预填内容（与后端 session 格式一致），末尾带申诉预约标记 */
function buildAppealContent(v: IViolationAppoint): string {
  const student = (v as any).major_student.Sname ?? '（当前用户）'
  const room = v.Room ?? v.Rtitle ?? '—'
  const startStr = v.Astart ? formatAppointDateTime(v.Astart) : '—'
  const finishStr = v.Afinish_hour_minute ?? (v.Afinish ? v.Afinish.slice(11, 16) : '—')
  const reason = v.Areason ?? '（待填写）'
  const lines = [
    `申请人：${student}`,
    `房间：${room}`,
    `预约时间：${startStr} - ${finishStr}`,
    `违规原因：${reason}`,
  ]
  return lines.join('\n')
}

function formatAppointDateTime(iso: string): string {
  const d = new Date(iso)
  const y = d.getFullYear()
  const m = d.getMonth() + 1
  const day = d.getDate()
  const h = String(d.getHours()).padStart(2, '0')
  const min = String(d.getMinutes()).padStart(2, '0')
  return `${y}年${m}月${day}日 ${h}:${min}`
}

/** 在我的反馈中查找该预约是否已有申诉（仅按类型 + 标题「预约申诉(aid)」） */
function findExistingAppealByAid(items: Feedback[], aid: number): Feedback | undefined {
  const title = appealTitle(aid)
  return items.find((item) => {
    if (String(item.feedback_type) !== String(APPEAL_TYPE_ID))
      return false
    const firstLine = (item.content ?? '').split('\n')[0]?.trim() ?? ''
    return firstLine === title
  })
}

function onCardClick(item: Feedback) {
  uni.navigateTo({ url: `/pages/appmenu/feedbackDetail?id=${item.id}` })
}

async function submitFeedback(asDraft: boolean) {
  const typeId = formTypeId.value
  const title = formTitle.value.trim()
  const body = formContent.value.trim()
  if (!typeId) {
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
  const content = title ? `${title}\n${body}` : (body || '(草稿)')
  try {
    formSubmitting.value = true
    const payload: FeedbackCreate = {
      feedback_type: typeId,
      content,
      issue_status: asDraft ? 0 : 1,
    }
    await createFeedback(payload)
    uni.showToast({ title: asDraft ? '草稿已保存' : '提交成功', icon: 'success' })
    formTitle.value = ''
    formContent.value = ''
    isAppealFromAid.value = false
    loadMyFeedback()
    if (!asDraft)
      backToList()
    else
      loadList()
  }
  catch (e) {
    console.error('提交失败', e)
    uni.showToast({ title: '提交失败', icon: 'none' })
  }
  finally {
    formSubmitting.value = false
  }
}

/** 处理从 querystring 进入的申诉/预填：feedback_id → 跳转详情；aid → 已有申诉跳转否则预填；type/content → 预填表单 */
onLoad(async (options: Record<string, string> = {}) => {
  const feedbackId = options.feedback_id ?? options.id
  const typeParam = options.type ?? options.feedback_type
  const contentParam = options.content ?? options.feedback_content
  const aidParam = options.aid ? Number(options.aid) : 0
  const roomParam = options.room ? decodeURIComponent(options.room) : ''

  if (feedbackId) {
    uni.redirectTo({ url: `/pages/appmenu/feedbackDetail?id=${feedbackId}` })
    return
  }

  if (aidParam > 0) {
    try {
      const [draftRes, publishedRes] = await Promise.all([
        listFeedback({ issue_status: 0, ordering: '-modify_time' }),
        listFeedback({ issue_status: 1, ordering: '-feedback_time' }),
      ])
      const myAll = [...draftRes, ...publishedRes]
      const existing = findExistingAppealByAid(myAll, aidParam)
      if (existing) {
        uni.redirectTo({ url: `/pages/appmenu/feedbackDetail?id=${existing.id}` })
        return
      }
      const violationsRes = await getMyViolations()
      const violation = violationsRes?.vio_list?.find(v => v.Aid === aidParam)
      formTitle.value = appealTitle(aidParam)
      isAppealFromAid.value = true
      if (violation) {
        formContent.value = buildAppealContent(violation)
        formTypeId.value = APPEAL_TYPE_ID
      }
      else {
        formContent.value = [
          `申请人：（待填写）`,
          `房间：${roomParam || '—'}`,
          `预约ID：${aidParam}`,
          `违规原因：（待填写）`,
        ].join('\n')
        formTypeId.value = APPEAL_TYPE_ID
      }
      await loadTypes()
      if (!feedbackTypes.value.some(t => String(t.id) === String(APPEAL_TYPE_ID)))
        formTypeId.value = feedbackTypes.value[0]?.id ?? APPEAL_TYPE_ID
      showCreateForm.value = true
    }
    catch (e) {
      console.error('申诉预填失败', e)
      uni.showToast({ title: '加载失败', icon: 'none' })
    }
    return
  }

  if (typeParam || contentParam) {
    if (typeParam)
      formTypeId.value = decodeURIComponent(typeParam)
    if (contentParam)
      formContent.value = decodeURIComponent(contentParam)
    await loadTypes()
    if (typeParam && !feedbackTypes.value.some(t => String(t.id) === String(formTypeId.value)))
      formTypeId.value = feedbackTypes.value[0]?.id ?? formTypeId.value
    showCreateForm.value = true
  }
})

onMounted(() => {
  loadList()
  loadMyFeedback()
})
</script>

<template>
  <view class="feedback-page min-h-screen bg-[#f8f9fa] pb-10">
    <!-- 写反馈表单（与网页「反馈详情」一致，适配手机屏宽、防点击闪屏） -->
    <view v-if="showCreateForm" class="feedback-form-screen">
      <view class="feedback-form-header">
        <view class="feedback-form-header-side" hover-class="none" @click="backToList">
          <text class="i-carbon-arrow-left text-xl text-[#1b55e2]" />
        </view>
        <text class="feedback-form-title">反馈详情</text>
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
              :value="feedbackTypes.findIndex(t => t.id === formTypeId)"
              :range="feedbackTypes"
              range-key="name"
              class="form-picker"
              @change="(e: any) => { formTypeId = feedbackTypes[e.detail.value]?.id ?? '' }"
            >
              <view class="form-picker-inner">
                <text class="form-picker-text ellipsis">{{ feedbackTypes.find(t => t.id === formTypeId)?.name ?? '请选择反馈类型' }}</text>
                <text class="i-carbon-chevron-down form-picker-arrow" />
              </view>
            </picker>
          </view>
          <!-- 反馈标题（从申诉入口进入时锁定为「预约申诉(aid)」） -->
          <view class="form-group mb-4">
            <text class="mb-2 block text-sm text-[#424344] font-medium">反馈标题</text>
            <input
              v-model="formTitle"
              type="text"
              class="form-input"
              :class="{ 'form-input-disabled': isAppealFromAid }"
              placeholder="标题不能超过25字符噢！"
              :maxlength="25"
              :disabled="isAppealFromAid"
            >
            <text v-if="isAppealFromAid" class="mt-1 block text-xs text-gray-500">申诉标题不可修改</text>
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

    <!-- 主界面：与网页版一致的布局 -->
    <view v-else class="layout-top-spacing">
      <!-- 左侧欢迎区 -->
      <view class="bio layout-spacing px-4 pt-4">
        <view class="widget-content relative rounded-lg bg-white p-4 shadow-sm">
          <!-- 装饰边框：右侧竖线、底部横线 -->
          <view
            class="border-right absolute right-0 border-l border-[#d3d3d3]"
            style="top: 16%; bottom: 20%;"
          />
          <view
            class="border-bottom absolute bottom-0 left-[20%] right-[20%] border-b border-[#d3d3d3]"
          />
          <view class="pricing-header relative px-1 py-2">
            <view class="mb-4 flex items-center justify-center">
              <text class="text-lg text-[var(--text-main)] font-semibold">问答反馈中心</text>
              <view
                class="ml-2 h-8 w-8 flex items-center justify-center text-[#1b55e2]"
                hover-class="none"
                @click="goCreate"
              >
                <text class="i-carbon-add-alt text-2xl" />
              </view>
            </view>
            <text class="text-indent-2em block text-sm text-[#424344] leading-relaxed">
              欢迎你来到这里。这是学生权益诉求的集中地，也是信息交流的便捷平台，在这里我们用共同关心搭建共同生活的家园。
            </text>
            <text class="text-indent-2em mt-3 block text-sm text-[#424344] leading-relaxed">
              如果你在学习与生活中产生自己无法解答的困惑；对改善公共空间环境、改进学生组织工作有好的建议；或是有其他想要和组织迫切交流的观点；都可以点击上方的「+」向组织反馈！
            </text>
            <text class="text-indent-2em mt-3 block text-sm text-[#424344] leading-relaxed">
              您的反馈至始至终对组织匿名；欢迎公开您的反馈，为后来者提供帮助！
            </text>
          </view>
        </view>
      </view>

      <!-- 右侧：留言公开（公示栏） -->
      <view class="layout-spacing mt-4 px-4">
        <view class="bio-skill-box overflow-x-hidden overflow-y-auto rounded-lg bg-white shadow-sm">
          <view v-if="listLoading" class="py-12 text-center text-[#424344]">
            加载中...
          </view>
          <view v-else-if="list.length === 0" class="py-12 text-center text-[#424344]">
            暂无公开反馈
          </view>
          <view v-else class="public-feedback row px-2 pb-4">
            <view
              v-for="item in list"
              :key="item.id"
              class="b-skills mb-4 border border-gray-100 rounded-lg bg-gray-50/50 p-4"
              hover-class="none"
              @click="onCardClick(item)"
            >
              <view class="d-flex justify-content mb-2">
                <view class="flex-1">
                  <view class="flex flex-wrap items-center gap-2">
                    <text class="text-base text-[var(--text-main)] font-semibold">
                      {{ cardTitle(item) }}
                    </text>
                    <view
                      class="badge badge-pill rounded-full px-2 py-0.5 text-xs font-medium"
                      :class="solveStatusInfo(item.solve_status).class"
                    >
                      {{ item.solve_status_display ?? solveStatusInfo(item.solve_status).text }}
                    </view>
                  </view>
                </view>
              </view>
              <view class="flex items-start text-sm text-[#424344]">
                <text class="i-carbon-share mr-1 mt-0.5 shrink-0 text-base" />
                <text class="ml-1">反馈至 {{ item.feedback_type_display ?? '—' }}</text>
              </view>
              <view class="mt-1 flex items-start text-sm text-[#424344]">
                <text class="i-carbon-notification mr-1 mt-0.5 shrink-0 text-base" />
                <text class="ml-1">{{ formatDatePublic(item.feedback_time ?? item.modify_time ?? item.time) }}</text>
              </view>
              <view class="feedback-content mt-1 flex items-start text-sm text-[#424344]">
                <text class="i-carbon-email mr-1 mt-0.5 shrink-0 text-base" />
                <text class="line-clamp-2 ml-1 flex-1">{{ item.content || '—' }}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 我的反馈：草稿箱 / 进行中 / 已结束（放在最下面） -->
      <view class="bio layout-spacing mb-4 mt-4 px-4">
        <view class="widget-content widget-content-area rounded-lg bg-white p-4 shadow-sm">
          <view class="mb-4">
            <text class="text-lg text-[var(--text-main)] font-semibold">我的反馈</text>
          </view>
          <view class="nav-tabs nav-tabs-solid flex border border-gray-200 rounded-lg bg-gray-50">
            <view
              class="nav-item flex-1 text-center"
              :class="{ 'nav-link-active': myFeedbackTab === 'draft' }"
              hover-class="none"
              @click="setMyFeedbackTab('draft')"
            >
              <text class="block py-3 text-sm font-medium" :class="myFeedbackTab === 'draft' ? 'text-[#1b55e2]' : 'text-[#424344]'">
                <text class="i-carbon-email mr-1" />草稿箱
              </text>
            </view>
            <view
              class="nav-item flex-1 text-center"
              :class="{ 'nav-link-active': myFeedbackTab === 'inProgress' }"
              hover-class="none"
              @click="setMyFeedbackTab('inProgress')"
            >
              <text class="block py-3 text-sm font-medium" :class="myFeedbackTab === 'inProgress' ? 'text-[#1b55e2]' : 'text-[#424344]'">
                <text class="i-carbon-email mr-1" />进行中
              </text>
            </view>
            <view
              class="nav-item flex-1 text-center"
              :class="{ 'nav-link-active': myFeedbackTab === 'done' }"
              hover-class="none"
              @click="setMyFeedbackTab('done')"
            >
              <text class="block py-3 text-sm font-medium" :class="myFeedbackTab === 'done' ? 'text-[#1b55e2]' : 'text-[#424344]'">
                <text class="i-carbon-email mr-1" />已结束
              </text>
            </view>
          </view>
          <view class="tab-content mt-4">
            <!-- 草稿箱 -->
            <view v-show="myFeedbackTab === 'draft'" class="tab-pane">
              <view v-if="myListLoading" class="py-10 text-center text-sm text-[#424344]">
                加载中...
              </view>
              <view v-else-if="myDraftList.length === 0" class="py-10 text-center text-sm text-[#424344]">
                您没有反馈草稿。
              </view>
              <view v-else class="space-y-3">
                <view
                  v-for="item in myDraftList"
                  :key="item.id"
                  class="my-feedback-item border border-gray-100 rounded-lg bg-gray-50/50 p-3"
                  hover-class="none"
                  @click="onCardClick(item)"
                >
                  <view class="flex items-center justify-between">
                    <text class="line-clamp-1 text-sm text-[var(--text-main)] font-medium">{{ cardTitle(item) }}</text>
                  </view>
                  <view class="mt-1 text-xs text-[#424344]">
                    {{ formatDatePublic(item.modify_time ?? item.time) }}
                  </view>
                </view>
              </view>
            </view>
            <!-- 进行中 -->
            <view v-show="myFeedbackTab === 'inProgress'" class="tab-pane">
              <view v-if="myListLoading" class="py-10 text-center text-sm text-[#424344]">
                加载中...
              </view>
              <view v-else-if="myInProgressList.length === 0" class="py-10 text-center text-sm text-[#424344]">
                您没有在进行中的反馈。
              </view>
              <view v-else class="space-y-3">
                <view
                  v-for="item in myInProgressList"
                  :key="item.id"
                  class="my-feedback-item border border-gray-100 rounded-lg bg-gray-50/50 p-3"
                  hover-class="none"
                  @click="onCardClick(item)"
                >
                  <view class="flex flex-wrap items-center gap-2">
                    <text class="line-clamp-1 text-sm text-[var(--text-main)] font-medium">{{ cardTitle(item) }}</text>
                    <view class="badge badge-pill rounded-full px-2 py-0.5 text-xs" :class="solveStatusInfo(item.solve_status).class">
                      {{ item.solve_status_display ?? solveStatusInfo(item.solve_status).text }}
                    </view>
                  </view>
                  <view class="mt-1 text-xs text-[#424344]">
                    反馈至 {{ item.feedback_type_display ?? '—' }}
                  </view>
                </view>
              </view>
            </view>
            <!-- 已结束 -->
            <view v-show="myFeedbackTab === 'done'" class="tab-pane">
              <view v-if="myListLoading" class="py-10 text-center text-sm text-[#424344]">
                加载中...
              </view>
              <view v-else-if="myDoneList.length === 0" class="py-10 text-center text-sm text-[#424344]">
                您没有已完成的反馈。
              </view>
              <view v-else class="space-y-3">
                <view
                  v-for="item in myDoneList"
                  :key="item.id"
                  class="my-feedback-item border border-gray-100 rounded-lg bg-gray-50/50 p-3"
                  hover-class="none"
                  @click="onCardClick(item)"
                >
                  <view class="flex flex-wrap items-center gap-2">
                    <text class="line-clamp-1 text-sm text-[var(--text-main)] font-medium">{{ cardTitle(item) }}</text>
                    <view class="badge badge-pill rounded-full px-2 py-0.5 text-xs" :class="solveStatusInfo(item.solve_status).class">
                      {{ item.solve_status_display ?? solveStatusInfo(item.solve_status).text }}
                    </view>
                  </view>
                  <view class="mt-1 text-xs text-[#424344]">
                    反馈至 {{ item.feedback_type_display ?? '—' }}
                  </view>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<style lang="scss" scoped>
.layout-top-spacing {
  padding-top: 16px;
}
.layout-spacing {
  padding-bottom: 8px;
}
.text-indent-2em {
  text-indent: 2em;
}
/* 与网页 b-skills 一致的卡片 */
.b-skills {
  transition: opacity 0.15s;
}
/* 解决状态徽章（与网页 Bootstrap 一致） */
.badge-success {
  background-color: #28a745;
  color: #fff;
}
.badge-primary {
  background-color: #1b55e2;
  color: #fff;
}
.badge-warning {
  background-color: #ffc107;
  color: #212529;
}
.badge-secondary {
  background-color: #6c757d;
  color: #fff;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.nav-link-active {
  border-bottom: 2rpx solid #1b55e2;
  background: #fff;
}

/* ========== 写反馈表单：适配手机屏宽、防点击闪屏 ========== */
.feedback-form-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10;
  background: #fff;
  box-sizing: border-box;
}
.feedback-form-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24rpx 24rpx 24rpx 24rpx;
  border-bottom: 1rpx solid #e5e7eb;
  box-sizing: border-box;
}
.feedback-form-header-side {
  width: 80rpx;
  min-width: 80rpx;
  box-sizing: border-box;
}
.feedback-form-header-right {
  text-align: right;
}
.feedback-form-title {
  flex: 1;
  text-align: center;
  font-size: 36rpx;
  font-weight: 500;
  color: var(--text-main, #333);
}
.feedback-form-scroll {
  height: calc(100vh - 104rpx);
  box-sizing: border-box;
}
.feedback-form-body {
  padding: 24rpx;
  padding-bottom: 48rpx;
  box-sizing: border-box;
  max-width: 100%;
}
.form-picker {
  display: block;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}
.form-picker-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-width: 0;
  padding: 24rpx;
  border-radius: 16rpx;
  border: 1rpx solid #e5e7eb;
  background: #fff;
  color: #424344;
  box-sizing: border-box;
}
.form-picker-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 28rpx;
}
.form-picker-arrow {
  flex-shrink: 0;
  margin-left: 16rpx;
  font-size: 28rpx;
  color: #9ca3af;
}
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.form-textarea {
  width: 100%;
  min-height: 88rpx;
  padding: 24rpx;
  border-radius: 16rpx;
  border: 1rpx solid #e5e7eb;
  background: #fff;
  color: #424344;
  font-size: 28rpx;
  box-sizing: border-box;
}
.form-textarea-disabled {
  background: #f3f4f6;
  color: #6b7280;
}
.form-input {
  width: 100%;
  height: 80rpx;
  padding: 0 24rpx;
  border-radius: 16rpx;
  border: 1rpx solid #e5e7eb;
  background: #fff;
  color: #424344;
  font-size: 28rpx;
  box-sizing: border-box;
}
.form-input-disabled {
  background: #f3f4f6;
  color: #6b7280;
}
.form-textarea-large {
  min-height: 240rpx;
}
.form-buttons {
  display: flex;
  gap: 24rpx;
  margin-top: 32rpx;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}
.form-btn {
  flex: 1;
  min-width: 0;
  padding: 24rpx 16rpx;
  border-radius: 16rpx;
  text-align: center;
  font-size: 28rpx;
  font-weight: 500;
  box-sizing: border-box;
}
.form-btn-secondary {
  background: #f3f4f6;
  color: #424344;
}
.form-btn-primary {
  background: #1b55e2;
  color: #fff;
}
.form-btn-disabled {
  opacity: 0.7;
}
</style>
