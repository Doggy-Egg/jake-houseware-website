export const adminNavigation = [
  { label: "概览", href: "/admin" },
  { label: "产品管理", href: "/admin/products" },
  { label: "分类管理", href: "/admin/categories" },
] as const;

export const categoryAdminLabels: Record<string, string> = {
  "wine-accessories": "酒具配件",
  barware: "酒吧器皿",
  "whiskey-accessories": "威士忌配件",
  "coffee-accessories": "咖啡配件",
  "kitchen-gadgets": "厨房小工具",
  "lifestyle-accessories": "生活方式配件",
  sets: "套装系列",
};

export const collectionAdminLabels: Record<string, string> = {
  "premium-collection": "精品系列",
  "best-sellers": "热销款",
  "new-arrivals": "新品上架",
};

export const subCategoryAdminLabels: Record<string, string> = {
  "waiters-corkscrews": "侍酒师开瓶器",
  "easy-corkscrews": "简易开瓶器",
  "wine-stoppers": "酒塞",
  "wine-charms": "酒杯标记",
  "other-wine-accessories": "其他酒具配件",
  "cocktail-shakers": "调酒摇壶",
  jiggers: "量酒器",
  strainers: "滤酒器",
  "mixing-glasses": "调酒杯",
  "bar-accessories": "酒吧配件",
  "whiskey-glasses": "威士忌杯",
  "whiskey-stones": "威士忌冰石",
  "ice-moulds": "冰模",
  "ice-buckets": "冰桶",
  "other-whiskey-accessories": "其他威士忌配件",
  "coffee-tools": "咖啡工具",
  "other-coffee-accessories": "咖啡配件",
  "citrus-squeezers": "榨汁器",
  nutcrackers: "坚果夹",
  "other-kitchen-gadgets": "厨房小工具",
  "hip-flasks": "酒壶",
  "hip-flask-sets": "酒壶套装",
  "cigar-cutters": "雪茄剪",
  "bartender-sets": "调酒师套装",
  "wine-sets": "酒具套装",
  "whiskey-sets": "威士忌套装",
  "coffee-sets": "咖啡套装",
  "other-sets": "其他套装",
};

export const adminCopy = {
  panelBadge: "管理后台",
  backToSite: "← 返回网站",
  loading: "加载中...",
  productNotFound: "未找到该产品",
  backToProducts: "返回产品列表",
  confirmDelete: (name: string) =>
    `确定删除「${name}」吗？当前阶段删除后无法恢复。`,
  noProducts: "暂无产品",
  noImages: "暂无图片，请上传或填写 URL",
  regularProduct: "普通商品",
  optional: "可选",
} as const;

export const productStatusLabels: Record<
  "draft" | "active" | "inactive",
  string
> = {
  draft: "草稿",
  active: "已发布",
  inactive: "已下架",
};
