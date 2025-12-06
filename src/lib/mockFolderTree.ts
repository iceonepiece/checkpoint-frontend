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
          { id: "env1", name: "Environment" },
          { id: "env2", name: "Environment" },
          { id: "env3", name: "Environment" },
          { id: "env4", name: "Environment" },
          { id: "env5", name: "Environment" },
          { id: "env6", name: "Environment" },
          { id: "env7", name: "Environment" },
          { id: "env8", name: "Environment" },
          { id: "env9", name: "Environment" },
          { id: "env10", name: "Environment" },
          { id: "env11", name: "Environment" },
          { id: "env12", name: "Environment" },
          { id: "env13", name: "Environment" },
          { id: "env14", name: "Environment" },
          { id: "env15", name: "Environment" },
          { id: "env16", name: "Environment" },
          { id: "env17", name: "Environment" },
          { id: "env18", name: "Environment" },
        ]
      },
    ],
  },
];
