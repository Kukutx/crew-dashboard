# README

`@umijs/max` 模板项目，更多功能参考 [Umi Max 简介](https://umijs.org/docs/max/introduce)

## 项目结构

```
src/
  pages/
    Access/     # 权限示例
    Home/       # 首页
    Table/      # CRUD 示例
    Crew/       # 船员管理模块
    Vessel/     # 船舶管理模块
    Schedule/   # 排班模块
    Reports/    # 报表模块
```

每个模块页面均使用 `PageContainer` 作为统一布局，并预留了子路由与组件目录，便于后续填充业务逻辑。
