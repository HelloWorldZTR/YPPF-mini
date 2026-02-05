<script lang="ts" setup>
import type { Feedback, FeedbackCreate, FeedbackType, OrganizationInfoResponse, PatchedFeedbackUpdate } from '@/api/types/feedback'
import { nextTick, onMounted, watch } from 'vue'
import {
  createFeedback,
  getFeedback,
  getFeedbackTypes,
  getOrganizationInfo,
  partialUpdateFeedback,
} from '@/api/feedback'

definePage({
  style: {
    navigationBarTitleText: '写反馈',
    navigationBarBackgroundColor: '#1b55e2',
    navigationBarTextStyle: 'white',
  },
})

// 从路由参数获取草稿ID（编辑模式）
const draftId = ref<string>('')
const isEditMode = computed(() => !!draftId.value)

// 表单状态
const formTypeId = ref<string | number>('')
const formTitle = ref('')
const formContent = ref('')
const formPublisherPublic = ref(true)
const formSubmitting = ref(false)
const formOrgType = ref('')
const formOrg = ref('')

// 反馈类型
const feedbackTypes = ref<FeedbackType[]>([])

// 组织信息（从后端加载）
const organizationInfo = ref<OrganizationInfoResponse | null>(null)
const orgTypeOptions = computed(() => {
  if (!organizationInfo.value)
    return []
  return organizationInfo.value.org_types.map(ot => ({
    value: ot.otype_name,
    label: ot.otype_name,
  }))
})

// 接收小组（按类型联动，从后端数据构建）
const orgByType = computed(() => {
  if (!organizationInfo.value)
    return {}
  const result: Record<string, { value: string, label: string }[]> = {}
  // 使用后端返回的 org_type_to_orgs 映射
  Object.keys(organizationInfo.value.org_type_to_orgs).forEach((orgTypeName) => {
    const orgNames = organizationInfo.value!.org_type_to_orgs[orgTypeName]
    result[orgTypeName] = orgNames.map(name => ({ value: name, label: name }))
  })
  return result
})

// 反馈类型到接收小组类型的映射（从后端加载）
const feedbackTypeToOrg = computed(() => {
  if (!organizationInfo.value)
    return {}
  return organizationInfo.value.feedback_type_mappings
})

const orgOptions = computed(() => orgByType.value[formOrgType.value] ?? [])

// 反馈类型数组（用于 picker，只使用接口数据）
const feedbackTypesArray = computed(() => {
  return feedbackTypes.value
})

// 反馈类型 picker 的索引（确保返回有效值）
const feedbackTypeIndex = computed(() => {
  const arr = feedbackTypesArray.value
  if (arr.length === 0)
    return 0
  const idx = arr.findIndex(t => t.id === formTypeId.value)
  return idx >= 0 ? idx : 0
})

// 组织类型 picker 的索引
const orgTypeIndex = computed(() => {
  const idx = orgTypeOptions.value.findIndex(o => o.value === formOrgType.value)
  return idx >= 0 ? idx : 0
})

// 组织 picker 的索引
const orgIndex = computed(() => {
  const idx = orgOptions.value.findIndex(o => o.value === formOrg.value)
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
  const mapping = feedbackTypeToOrg.value[feedbackType.name]
  if (mapping) {
    if (mapping.org_type_name) {
      formOrgType.value = mapping.org_type_name
      if (mapping.org_name) {
        // 等待 orgOptions 更新后再设置 org
        nextTick(() => {
          const orgExists = orgOptions.value.some(o => o.value === mapping.org_name)
          if (orgExists) {
            formOrg.value = mapping.org_name
          }
        })
      }
      else {
        // 如果没有指定组织，清空组织选择
        nextTick(() => {
          formOrg.value = ''
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

// 加载组织信息
async function loadOrganizationInfo() {
  try {
    const res = await getOrganizationInfo()
    // 验证响应数据结构
    if (!res || typeof res !== 'object') {
      console.error('组织信息响应格式错误:', res)
      uni.showToast({ title: '组织信息格式错误', icon: 'none', duration: 3000 })
      return
    }

    // 确保必要字段存在
    if (!Array.isArray(res.org_types)) {
      console.warn('组织信息缺少 org_types 字段，使用空数组')
      res.org_types = []
    }
    if (!Array.isArray(res.organizations)) {
      console.warn('组织信息缺少 organizations 字段，使用空数组')
      res.organizations = []
    }
    if (!res.org_type_to_orgs || typeof res.org_type_to_orgs !== 'object') {
      console.warn('组织信息缺少 org_type_to_orgs 字段，使用空对象')
      res.org_type_to_orgs = {}
    }
    if (!res.feedback_type_mappings || typeof res.feedback_type_mappings !== 'object') {
      console.warn('组织信息缺少 feedback_type_mappings 字段，使用空对象')
      res.feedback_type_mappings = {}
    }

    organizationInfo.value = res
    // 设置默认值（如果有数据且当前为空）
    if (res.org_types.length > 0 && !formOrgType.value) {
      formOrgType.value = res.org_types[0].otype_name
      // 等待 orgOptions 更新后设置默认组织
      await nextTick()
      const defaultOrgs = orgOptions.value
      if (defaultOrgs.length > 0) {
        formOrg.value = defaultOrgs[0].value
      }
    }
  }
  catch (e: any) {
    console.error('加载组织信息失败', e)
    // 提取更详细的错误信息
    let errorMsg = '加载组织信息失败'
    if (e?.response?.statusCode === 500) {
      errorMsg = '服务器错误，请联系管理员'
    }
    else if (e?.response?.data) {
      // 尝试从响应中提取错误信息
      const data = e.response.data
      if (typeof data === 'string' && data.includes('error')) {
        errorMsg = '服务器返回错误'
      }
      else if (data?.detail) {
        errorMsg = data.detail
      }
      else if (data?.message) {
        errorMsg = data.message
      }
    }
    else if (e?.message) {
      errorMsg = e.message
    }

    uni.showToast({
      title: errorMsg,
      icon: 'none',
      duration: 3000,
    })
    // 即使加载失败，也设置一个空对象，避免后续代码报错
    organizationInfo.value = {
      org_types: [],
      organizations: [],
      org_type_to_orgs: {},
      feedback_type_mappings: {},
    }
  }
}

// 初始化表单数据（编辑模式）
async function initFormData() {
  if (draftId.value) {
    try {
      // 获取完整的草稿数据
      const fullDraft = await getFeedback(draftId.value)
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
        // 如果没有 org_type_name，使用默认值（从后端数据获取第一个）
        if (organizationInfo.value && organizationInfo.value.org_types.length > 0) {
          formOrgType.value = organizationInfo.value.org_types[0].otype_name
          await nextTick()
          const defaultOrgs = orgOptions.value
          if (defaultOrgs.length > 0) {
            formOrg.value = defaultOrgs[0].value
          }
        }
        // 如果后端数据未加载，保持为空
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

    // 设置默认组织类型和组织（从后端数据获取）
    if (organizationInfo.value && organizationInfo.value.org_types.length > 0) {
      formOrgType.value = organizationInfo.value.org_types[0].otype_name
      const defaultOrgs = orgByType.value[formOrgType.value]
      if (defaultOrgs && defaultOrgs.length > 0) {
        formOrg.value = defaultOrgs[0].value
      }
      else {
        formOrg.value = ''
      }
    }
    // 如果后端数据未加载，保持为空

    // 确保 formTypeId 有值（允许 id 为 0）
    if ((formTypeId.value === null || formTypeId.value === undefined || formTypeId.value === '') && feedbackTypesArray.value.length > 0) {
      formTypeId.value = feedbackTypesArray.value[0].id
    }
  }
}

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
    if (draftId.value) {
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
      result = await partialUpdateFeedback(draftId.value, updatePayload)
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

    // 提交成功后返回上一页
    setTimeout(() => {
      uni.navigateBack()
    }, 1500)
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

// 页面挂载时加载数据
onMounted(async () => {
  // 获取路由参数
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = (currentPage as any).options || {}
  draftId.value = options.id || ''

  // 并行加载反馈类型和组织信息
  await Promise.all([
    loadTypes(),
    loadOrganizationInfo(),
  ])

  // 初始化表单数据
  await initFormData()
})
</script>

<template>
  <view class="feedback-form-page min-h-screen bg-[#f8f9fa] pb-10">
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
            :value="orgTypeIndex"
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
            :value="orgIndex"
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
.feedback-form-page {
  padding-top: 0;
}

.feedback-form-scroll {
  height: 100vh;
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
