export type TreeNode = {
  id: string;
  name: string;
  children?: TreeNode[];
};

export const MOCK_TREE: TreeNode[] = [
  {
    id: "assets",
    name: "Assets",
    children: [
      { id: "anim", name: "Animation" },
      { id: "sprite", name: "Sprite" },
      { id: "mat", name: "Material" },
      { id: "mesh", name: "Meshes", 
        children: [
          { id: "char", name: "Character" },
          { id: "env", name: "Environment" },
        ]
      },
    ],
  },
];
