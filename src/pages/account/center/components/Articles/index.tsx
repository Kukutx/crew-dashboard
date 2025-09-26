import { LikeOutlined, MessageFilled, StarTwoTone } from '@ant-design/icons';
import { useIntl, useRequest } from '@umijs/max';
import { List, Tag } from 'antd';
import React from 'react';
import type { ListItemDataType } from '../../data.d';
import { queryFakeList } from '../../service';
import ArticleListContent from '../ArticleListContent';
import useStyles from './index.style';

const Articles: React.FC = () => {
  const intl = useIntl();
  const { styles } = useStyles();
  const IconText: React.FC<{
    icon: React.ReactNode;
    text: React.ReactNode;
  }> = ({ icon, text }) => (
    <span>
      {icon} {text}
    </span>
  );

  // 获取tab列表数据
  const { data: listData } = useRequest(() => {
    return queryFakeList({
      count: 30,
    });
  });
  return (
    <List<ListItemDataType>
      size="large"
      className={styles.articleList}
      rowKey="id"
      itemLayout="vertical"
      dataSource={listData?.list || []}
      style={{
        margin: '0 -24px',
      }}
      renderItem={(item) => (
        <List.Item
          key={item.id}
          actions={[
            <IconText key="star" icon={<StarTwoTone />} text={item.star} />,
            <IconText key="like" icon={<LikeOutlined />} text={item.like} />,
            <IconText
              key="message"
              icon={<MessageFilled />}
              text={item.message}
            />,
          ]}
        >
          <List.Item.Meta
            title={
              <a className={styles.listItemMetaTitle} href={item.href}>
                {item.title}
              </a>
            }
            description={
              <span>
                <Tag>
                  {intl.formatMessage({
                    id: 'pages.account.center.articles.tag.ant-design',
                  })}
                </Tag>
                <Tag>
                  {intl.formatMessage({
                    id: 'pages.account.center.articles.tag.design-language',
                  })}
                </Tag>
                <Tag>
                  {intl.formatMessage({
                    id: 'pages.account.center.articles.tag.ant-financial',
                  })}
                </Tag>
              </span>
            }
          />
          <ArticleListContent data={item} />
        </List.Item>
      )}
    />
  );
};
export default Articles;
