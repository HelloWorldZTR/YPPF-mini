## 开发设置

### S1: 安装yppf后端，并且运行起来，大体流程

```
在github上 fork这个仓库 https://github.com/helloworldztr/yppf
git clone 你刚fork的仓库
git checkout mini-app # 注意我们都在mini-app分支下开发
如果你需要修改，记得创建自己的分支，如 git checkout -b my-feature-branch
按照devcontainer启动开发容器
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```
这时候，你的yppf后端就运行起来了，默认是运行在 `localhost:8000`，你可以通过 `http://localhost:8000/admin` 访问后台管理界面，使用刚才创建的超级用户登录。
访问 `http://localhost:8000/api/docs/` 可以看到API文档。

## S2: 配置前端

安装微信开发者工具，下载地址https://developers.weixin.qq.com/miniprogram/dev/devtools/log.html#nightly-2.01.2601162
需要的开发者身份、AppID可见于微信群里。APP Secret请务必不要提交到公共仓库。

安装nodejs和pnpm取决于你的系统，可以参考官方文档进行安装。

执行 `pnpm i` 安装依赖。
weixin平台：`pnpm dev:mp` 然后打开微信开发者工具，导入本地文件夹，选择本项目的`dist/dev/mp-weixin` 文件。

## 📦 运行（支持热更新）

- web平台： `pnpm dev:h5`, 然后打开 [http://localhost:9000/](http://localhost:9000/)。
- weixin平台：`pnpm dev:mp` 然后打开微信开发者工具，导入本地文件夹，选择本项目的`dist/dev/mp-weixin` 文件。
- APP平台：`pnpm dev:app`, 然后打开 `HBuilderX`，导入刚刚生成的`dist/dev/app` 文件夹，选择运行到模拟器(开发时优先使用)，或者运行的安卓/ios基座。(如果是 `安卓` 和 `鸿蒙` 平台，则不用这个方式，可以把整个unibest项目导入到hbx，通过hbx的菜单来运行到对应的平台。)

## 🔗 发布

- web平台： `pnpm build:h5`，打包后的文件在 `dist/build/h5`，可以放到web服务器，如nginx运行。如果最终不是放在根目录，可以在 `manifest.config.ts` 文件的 `h5.router.base` 属性进行修改。
- weixin平台：`pnpm build:mp`, 打包后的文件在 `dist/build/mp-weixin`，然后通过微信开发者工具导入，并点击右上角的“上传”按钮进行上传。
- APP平台：`pnpm build:app`, 然后打开 `HBuilderX`，导入刚刚生成的`dist/build/app` 文件夹，选择发行 - APP云打包。(如果是 `安卓` 和 `鸿蒙` 平台，则不用这个方式，可以把整个unibest项目导入到hbx，通过hbx的菜单来发行到对应的平台。)

## 📄 License

[MIT](https://opensource.org/license/mit/)

Copyright (c) 2025 菲鸽

## 捐赠

<p align='center'>
<img alt="special sponsor appwrite" src="https://oss.laf.run/ukw0y1-site/pay/wepay.png" height="330" style="display:inline-block; height:330px;">
<img alt="special sponsor appwrite" src="https://oss.laf.run/ukw0y1-site/pay/alipay.jpg" height="330" style="display:inline-block; height:330px; margin-left:10px;">
</p>
