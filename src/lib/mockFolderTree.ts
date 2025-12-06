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
      { 
        id: "chars", 
        name: "Characters",
        children: [
           { id: "player", name: "Player_Hero" },
           { id: "enemies", name: "Enemies", children: [
               { id: "bosses", name: "Bosses" },
               { id: "mobs", name: "Basic_Mobs" }
           ]},
           { id: "npcs", name: "NPCs" }
        ]
      },
      { 
        id: "env", 
        name: "Environments",
        children: [
           { id: "forest", name: "Forest_Biome", children: [
               { id: "trees", name: "Trees" },
               { id: "rocks", name: "Rocks" },
               { id: "foliage", name: "Foliage" }
           ]},
           { id: "dungeon", name: "Dungeon_Keep" },
           { id: "village", name: "Village_Hub" }
        ]
      },
      { 
        id: "props", 
        name: "Props",
        children: [
           { id: "weapons", name: "Weapons" },
           { id: "items", name: "Consumables" },
           { id: "furniture", name: "Furniture" }
        ]
      },
      { 
        id: "ui", 
        name: "UI",
        children: [
           { id: "icons", name: "Icons" },
           { id: "hud", name: "HUD_Elements" },
           { id: "menus", name: "Menu_Screens" }
        ]
      },
      {
        id: "vfx",
        name: "VFX",
        children: [
           { id: "particles", name: "Particles" },
           { id: "shaders", name: "Shaders" }
        ]
      },
      {
        id: "audio",
        name: "Audio",
        children: [
           { id: "sfx", name: "SFX" },
           { id: "music", name: "Music_Tracks" },
           { id: "vo", name: "Voice_Overs" }
        ]
      }
    ],
  },
  {
      id: "settings",
      name: "ProjectSettings",
      children: [
          { id: "input", name: "InputManager" },
          { id: "tags", name: "TagsAndLayers" }
      ]
  }
];