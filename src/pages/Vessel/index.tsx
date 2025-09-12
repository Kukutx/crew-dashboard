import { PageContainer } from '@ant-design/pro-components';
import { Outlet } from '@umijs/max';

const VesselPage: React.FC = () => {
  return (
    <PageContainer>
      <Outlet />
    </PageContainer>
  );
};

export default VesselPage;
