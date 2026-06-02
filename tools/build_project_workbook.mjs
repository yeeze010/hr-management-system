import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const root = path.resolve(".");
const outDir = path.join(root, "deliverables", "spreadsheets");
const outPath = path.join(outDir, "HR管理系统项目管理工作簿.xlsx");

const workbook = Workbook.create();
const overview = workbook.worksheets.add("项目总览");
const schedule = workbook.worksheets.add("开发排期");
const assignment = workbook.worksheets.add("任务分工");
const tests = workbook.worksheets.add("测试用例");
const risks = workbook.worksheets.add("风险台账");

function write(sheet, range, values) {
  sheet.getRange(range).values = values;
}

function styleHeader(sheet, range) {
  const r = sheet.getRange(range);
  r.format.fill = "#1F4E79";
  r.format.font = { color: "#FFFFFF", bold: true, size: 11 };
  r.format.horizontalAlignment = "center";
  r.format.wrapText = true;
}

function styleBody(sheet, range) {
  const r = sheet.getRange(range);
  r.format.font = { name: "Microsoft YaHei", size: 10 };
  r.format.wrapText = true;
  r.format.borders = { preset: "all", style: "thin", color: "#D9E2F3" };
}

write(overview, "A1:H1", [["HR 管理系统项目总览", "", "", "", "", "", "", ""]]);
overview.getRange("A1:H1").merge();
overview.getRange("A1:H1").format.fill = "#EAF2F8";
overview.getRange("A1:H1").format.font = { bold: true, size: 16, color: "#1F4E79" };
overview.getRange("A1:H1").format.horizontalAlignment = "center";
write(overview, "A3:B10", [
  ["项目名称", "HR 管理系统"],
  ["推荐技术栈", "Vue 3 + TypeScript / Spring Boot / PostgreSQL / Redis / MinIO / Docker + Nginx"],
  ["项目周期", "16 周"],
  ["优先级范围", "P0 平台与核心 HR；P1 招聘、薪酬、报表；P2 绩效增强"],
  ["关键目标", "员工主数据统一、流程线上化、权限审计、报表可追溯"],
  ["验收口径", "P0 100% 通过，P1 按里程碑通过，无高危安全问题"],
  ["部署方式", "Docker Compose 起步，预留 Kubernetes 迁移能力"],
  ["交付资料", "需求规格、设计文档、排期分工、测试用例、验收标准"],
]);
styleBody(overview, "A3:B10");
overview.getRange("A3:A10").format.fill = "#D9EAF7";
overview.getRange("A3:A10").format.font = { bold: true, color: "#1F4E79" };
overview.getRange("A:B").format.columnWidthPx = 220;
overview.getRange("B:B").format.columnWidthPx = 620;

const scheduleRows = [
  ["阶段", "周次", "模块/任务", "负责人", "前置依赖", "交付物", "状态"],
  ["M1", "第1周", "需求访谈、角色权限边界、业务流程梳理", "产品经理/项目经理", "立项确认", "需求清单、业务流程", "未开始"],
  ["M1", "第2周", "原型、页面清单、数据库初版、接口初版", "产品经理/架构师/UI", "需求清单", "原型、概要设计", "未开始"],
  ["M2", "第3周", "前后端工程搭建、登录、权限、菜单", "前端/后端", "概要设计", "基础平台", "未开始"],
  ["M2", "第4周", "系统管理、角色权限、字典、审计日志", "后端/前端", "基础平台", "系统管理模块", "未开始"],
  ["M3", "第5周", "组织架构、岗位、员工列表与详情", "前端/后端", "系统管理", "组织员工模块", "未开始"],
  ["M3", "第6周", "合同附件、批量导入、员工变更记录", "前端/后端", "员工档案", "档案增强模块", "未开始"],
  ["M3", "第7周", "招聘需求、候选人、Offer、入职清单", "前端/后端", "员工档案", "招聘入职模块", "未开始"],
  ["M3", "第8周", "审批中心、流程实例、待办通知", "后端/前端", "权限与业务单据", "流程审批模块", "未开始"],
  ["M4", "第9周", "考勤记录、请假、加班、补卡", "前端/后端", "审批中心", "考勤假勤模块", "未开始"],
  ["M4", "第10周", "薪资项、薪资批次、薪资单", "后端/前端", "员工档案/考勤", "薪酬模块", "未开始"],
  ["M4", "第11周", "绩效周期、目标、评分、确认", "前端/后端", "员工档案", "绩效模块", "未开始"],
  ["M4", "第12周", "报表中心、导出任务、权限水印", "后端/前端", "业务模块", "报表中心", "未开始"],
  ["M5", "第13周", "系统联调、接口测试、缺陷修复", "测试/全体", "M2-M4", "联调报告", "未开始"],
  ["M5", "第14周", "UAT、性能测试、安全测试", "测试/运维", "联调完成", "测试报告", "未开始"],
  ["M5", "第15周", "预生产部署、数据导入演练、培训", "运维/产品", "测试通过", "部署与培训材料", "未开始"],
  ["M5", "第16周", "生产上线、验收、运维交接", "项目经理/运维", "预生产通过", "验收报告", "未开始"],
];
write(schedule, "A1:G17", scheduleRows);
styleHeader(schedule, "A1:G1");
styleBody(schedule, "A1:G17");
schedule.getRange("A:G").format.columnWidthPx = 130;
schedule.getRange("C:C").format.columnWidthPx = 260;
schedule.getRange("E:F").format.columnWidthPx = 210;
schedule.getRange("G2:G17").conditionalFormats.add("containsText", {
  text: "未开始",
  format: { fill: "#FCE4D6", font: { color: "#9C5700", bold: true } },
});

const assignmentRows = [
  ["岗位", "建议人数", "核心职责", "主要产出", "验收方式"],
  ["项目经理", "1", "范围、进度、风险、沟通、验收闭环", "项目计划、周报、风险台账、验收报告", "里程碑按期完成，风险有闭环"],
  ["产品经理", "1", "需求、原型、验收标准、用户培训", "PRD、原型、验收用例、用户手册", "业务确认且测试可执行"],
  ["UI/UX 设计", "1", "后台规范、关键页面、响应式与可用性", "设计稿、组件规范、交互说明", "核心页面评审通过"],
  ["前端开发", "2", "Vue 页面、组件、状态、权限、联调", "前端工程、页面、组件库", "页面功能与接口联调通过"],
  ["后端开发", "2", "Spring Boot 服务、数据库、流程、文件、报表", "服务接口、数据库迁移、业务逻辑", "接口测试与业务验收通过"],
  ["测试工程师", "1", "测试计划、用例、缺陷、回归、报告", "测试用例、缺陷清单、测试报告", "P0/P1 用例通过率达标"],
  ["DevOps/运维", "0.5-1", "容器部署、监控、备份、发布回滚", "部署脚本、监控、备份方案", "预生产与生产部署成功"],
];
write(assignment, "A1:E8", assignmentRows);
styleHeader(assignment, "A1:E1");
styleBody(assignment, "A1:E8");
assignment.getRange("A:E").format.columnWidthPx = 170;
assignment.getRange("C:E").format.columnWidthPx = 260;

const testRows = [
  ["编号", "模块", "用例名称", "前置条件", "测试步骤", "预期结果", "优先级", "类型"],
  ["TC-001", "认证权限", "登录成功", "账号有效", "输入账号密码并提交", "进入工作台并加载菜单", "P0", "功能"],
  ["TC-002", "认证权限", "菜单权限隔离", "不同角色账号", "分别登录查看菜单", "仅展示授权菜单和按钮", "P0", "安全"],
  ["TC-003", "组织员工", "新建员工档案", "有 HR 权限", "填写必填字段并保存", "生成员工编号并可查询", "P0", "功能"],
  ["TC-004", "组织员工", "批量导入员工", "准备合法模板", "上传 Excel 并确认导入", "导入成功并生成校验报告", "P0", "集成"],
  ["TC-005", "合同附件", "上传合同附件", "员工存在", "上传 PDF 合同", "MinIO 保存成功且详情可查看", "P0", "集成"],
  ["TC-006", "审批中心", "请假审批通过", "员工提交请假", "主管审批通过", "请假单生效并扣减余额", "P0", "流程"],
  ["TC-007", "考勤假勤", "补卡申请驳回", "存在缺卡记录", "提交补卡并驳回", "记录保持异常并留痕", "P1", "流程"],
  ["TC-008", "薪酬管理", "生成薪资批次", "员工和薪资项存在", "创建批次并生成", "生成员工薪资明细", "P1", "功能"],
  ["TC-009", "报表中心", "导出员工结构报表", "有报表权限", "筛选部门并导出", "生成 Excel 且记录导出审计", "P1", "报表"],
  ["TC-010", "安全审计", "越权访问员工详情", "普通员工账号", "访问他人档案接口", "返回 403 并记录安全日志", "P0", "安全"],
  ["TC-011", "性能", "员工列表分页性能", "10 万员工数据", "查询第一页和复杂筛选", "2 秒内返回", "P1", "性能"],
  ["TC-012", "部署", "服务健康检查", "预生产部署完成", "访问 health endpoint", "返回 UP 且依赖状态正常", "P0", "部署"],
];
write(tests, "A1:H13", testRows);
styleHeader(tests, "A1:H1");
styleBody(tests, "A1:H13");
tests.getRange("A:H").format.columnWidthPx = 140;
tests.getRange("E:F").format.columnWidthPx = 260;
tests.getRange("G2:G13").conditionalFormats.add("containsText", {
  text: "P0",
  format: { fill: "#F8CBAD", font: { color: "#9C0006", bold: true } },
});

const riskRows = [
  ["编号", "风险", "概率", "影响", "等级", "应对措施", "责任人"],
  ["R-001", "需求边界膨胀", "中", "高", "高", "冻结 P0/P1 范围，新增需求进入变更评审或二期", "项目经理"],
  ["R-002", "薪酬规则复杂", "中", "高", "高", "先实现标准薪资项，复杂规则预留公式扩展", "后端负责人"],
  ["R-003", "历史数据质量差", "高", "中", "中", "导入模板、校验报告、清洗脚本、灰度导入", "产品经理"],
  ["R-004", "权限越权", "中", "高", "高", "接口级权限、数据范围、文件权限、安全测试", "后端负责人"],
  ["R-005", "审批流变化频繁", "中", "中", "中", "流程配置化，实例保留版本快照", "架构师"],
  ["R-006", "上线影响业务", "低", "高", "中", "预生产演练、回滚预案、分批上线、双轨观察", "运维"],
];
write(risks, "A1:G7", riskRows);
styleHeader(risks, "A1:G1");
styleBody(risks, "A1:G7");
risks.getRange("A:G").format.columnWidthPx = 130;
risks.getRange("B:B").format.columnWidthPx = 220;
risks.getRange("F:F").format.columnWidthPx = 320;
risks.getRange("E2:E7").conditionalFormats.add("containsText", {
  text: "高",
  format: { fill: "#FFC7CE", font: { color: "#9C0006", bold: true } },
});

for (const sheet of [overview, schedule, assignment, tests, risks]) {
  sheet.getRange("A1:H30").format.font = { name: "Microsoft YaHei", size: 10 };
  sheet.getRange("A1:H30").format.wrapText = true;
  sheet.getRange("A1:H30").format.autofitRows();
}

await fs.mkdir(outDir, { recursive: true });

await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 50 },
  summary: "final formula error scan",
});
for (const sheetName of ["项目总览", "开发排期", "任务分工", "测试用例", "风险台账"]) {
  await workbook.render({ sheetName, range: "A1:H18", scale: 1 });
}

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outPath);
console.log(outPath);
