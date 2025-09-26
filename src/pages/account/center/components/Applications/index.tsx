import {
  DownloadOutlined,
  EditOutlined,
  EllipsisOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { useIntl, useRequest } from '@umijs/max';
import { Avatar, Card, Dropdown, List, Tooltip } from 'antd';
import numeral from 'numeral';
import React from 'react';
import type { ListItemDataType } from '../../data.d';
import { queryFakeList } from '../../service';
import useStyles from './index.style';
export function formatWan(val: number, wanLabel: string = '万') {
  const v = val * 1;
  if (!v || Number.isNaN(v)) return '';
  let result: React.ReactNode = val;
  if (val > 10000) {
    result = (
      <span>
        {Math.floor(val / 10000)}
        <span
          style={{
            position: 'relative',
            top: -2,
            fontSize: 14,
            fontStyle: 'normal',
            marginLeft: 2,
          }}
        >
          {wanLabel}
        </span>
      </span>
    );
  }
  return result;
}
const Applications: React.FC = () => {
  const intl = useIntl();
  const { styles: stylesApplications } = useStyles();
  // 获取tab列表数据
  const { data: listData } = useRequest(() => {
    return queryFakeList({
      count: 30,
    });
  });

  const CardInfo: React.FC<{
    activeUser: React.ReactNode;
    newUser: React.ReactNode;
  }> = ({ activeUser, newUser }) => (
    <div className={stylesApplications.cardInfo}>
      <div>
        <p>
          {intl.formatMessage({
            id: 'pages.account.center.applications.active-user',
          })}
        </p>
        <p>{activeUser}</p>
      </div>
      <div>
        <p>
          {intl.formatMessage({
            id: 'pages.account.center.applications.new-user',
          })}
        </p>
        <p>{newUser}</p>
      </div>
    </div>
  );
  return (
    <List<ListItemDataType>
      rowKey="id"
      className={stylesApplications.filterCardList}
      grid={{
        gutter: 24,
        xxl: 3,
        xl: 2,
        lg: 2,
        md: 2,
        sm: 2,
        xs: 1,
      }}
      dataSource={listData?.list || []}
      renderItem={(item) => (
        <List.Item key={item.id}>
          <Card
            hoverable
            styles={{
              body: {
                paddingBottom: 20,
              },
            }}
            actions={[
              <Tooltip
                key="download"
                title={intl.formatMessage({
                  id: 'pages.account.center.applications.download',
                })}
              >
                <DownloadOutlined />
              </Tooltip>,
              <Tooltip
                title={intl.formatMessage({
                  id: 'pages.account.center.applications.edit',
                })}
                key="edit"
              >
                <EditOutlined />
              </Tooltip>,
              <Tooltip
                title={intl.formatMessage({
                  id: 'pages.account.center.applications.share',
                })}
                key="share"
              >
                <ShareAltOutlined />
              </Tooltip>,
              <Dropdown
                menu={{
                  items: [
                    {
                      key: '1',
                      label: intl.formatMessage({
                        id: 'pages.account.center.applications.more-1',
                      }),
                    },
                    {
                      key: '2',
                      label: intl.formatMessage({
                        id: 'pages.account.center.applications.more-2',
                      }),
                    },
                  ],
                }}
                key="ellipsis"
              >
                <EllipsisOutlined />
              </Dropdown>,
            ]}
          >
            <Card.Meta
              avatar={<Avatar size="small" src={item.avatar} />}
              title={item.title}
            />
            <div>
              <CardInfo
                activeUser={formatWan(
                  item.activeUser,
                  intl.formatMessage({
                    id: 'pages.account.center.applications.wan',
                  }),
                )}
                newUser={numeral(item.newUser).format('0,0')}
              />
            </div>
          </Card>
        </List.Item>
      )}
    />
  );
};
export default Applications;
