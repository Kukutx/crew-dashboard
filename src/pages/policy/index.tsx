import { PageContainer } from '@ant-design/pro-components';
import { Card, Divider, List, Typography } from 'antd';
import React from 'react';

const disclaimerItems = [
  '本平台旨在支持乘务运营及信息协同，提供的数据和建议仅供内部决策参考，任何基于本平台信息所做的对外承诺需经公司授权。',
  '因不可抗力、第三方系统故障或网络异常导致的服务中断、数据延迟或丢失，平台将协助排查，但不承担由此产生的直接或间接损失。',
  '用户提交的内容由其本人负责，若内容涉及隐私、版权或其他法律风险，提交者需自行确认并承担相应责任。',
];

const privacyItems = [
  '严格遵守国家和行业对于个人信息保护的法律法规，未经授权不会向第三方披露、出售或出租用户信息。',
  '对收集的姓名、联系方式、排班等敏感信息均采用分级权限管理与加密存储，确保数据在传输及存储过程中的安全性。',
  '仅在反馈处理、服务保障或合规要求范围内使用用户信息，超出用途前将再次征得授权并提供退出机制。',
];

const governanceItems = [
  '建立反馈全流程追踪机制，对工单指派、处理与验收进行透明记录，以便审计与复盘。',
  '定期回顾平台使用场景与数据分类，持续优化最小权限原则，避免无关人员访问敏感信息。',
  '针对外部系统集成，优先采用经过安全评估的接口与协议，并设置访问频率与异常告警。',
];

const updateItems = [
  '如条款发生调整，将通过站内通知、邮件或公告形式提前告知，重大变更将提供不少于七日的缓冲期。',
  '用户在通知后继续使用平台，即视为理解并同意更新后的政策；若有异议，可联系运营团队协助处理。',
];

const PolicyPage: React.FC = () => (
  <PageContainer
    header={{
      title: '政策与条款',
      subTitle: '明确信息使用边界，保护乘务队成员权益。',
    }}
  >
    <Card bordered={false} style={{ marginBottom: 24 }}>
      <Typography.Title level={4}>概述</Typography.Title>
      <Typography.Paragraph>
        本政策适用于 Crew Dashboard
        平台及其配套的移动端、通知服务等功能模块。我们致力于为乘务运营团队提供安全、透明、可追溯的反馈与信息管理体验，并确保相关数据在采集、处理与存储的全流程均符合法律法规与公司制度。
      </Typography.Paragraph>
      <Typography.Paragraph>
        如您对以下条款有任何疑问或需进一步说明，可通过平台内“联系我们”入口提交诉求，我们会在两个工作日内响应。
      </Typography.Paragraph>
    </Card>

    <Card title="免责条款" bordered={false} style={{ marginBottom: 24 }}>
      <List
        dataSource={disclaimerItems}
        renderItem={(item, index) => (
          <List.Item>
            <Typography.Paragraph>
              {index + 1}. {item}
            </Typography.Paragraph>
          </List.Item>
        )}
      />
    </Card>

    <Card title="用户隐私保护" bordered={false} style={{ marginBottom: 24 }}>
      <List
        dataSource={privacyItems}
        renderItem={(item, index) => (
          <List.Item>
            <Typography.Paragraph>
              {index + 1}. {item}
            </Typography.Paragraph>
          </List.Item>
        )}
      />
      <Divider />
      <Typography.Title level={5}>数据保留与删除</Typography.Title>
      <Typography.Paragraph>
        我们会在业务需求与法规要求允许的范围内保存反馈及用户数据，并提供导出与脱敏支持。若需删除或匿名化特定数据，请提交正式申请并说明原因，我们将在核验身份后予以协助。
      </Typography.Paragraph>
    </Card>

    <Card title="治理与安全" bordered={false} style={{ marginBottom: 24 }}>
      <List
        dataSource={governanceItems}
        renderItem={(item, index) => (
          <List.Item>
            <Typography.Paragraph>
              {index + 1}. {item}
            </Typography.Paragraph>
          </List.Item>
        )}
      />
    </Card>

    <Card title="条款更新" bordered={false}>
      <List
        dataSource={updateItems}
        renderItem={(item, index) => (
          <List.Item>
            <Typography.Paragraph>
              {index + 1}. {item}
            </Typography.Paragraph>
          </List.Item>
        )}
      />
      <Divider />
      <Typography.Paragraph>
        最近更新日期：2025 年 1 月 20 日。
      </Typography.Paragraph>
    </Card>
  </PageContainer>
);

export default PolicyPage;
