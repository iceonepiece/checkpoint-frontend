export type TreeNode = {
  id: string;
  name: string;
  children?: TreeNode[];
  lockedBy?: string;
  lockedAt?: string; 
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
      lockedBy: "Admin",
      lockedAt: "2024-01-01T00:00:00Z",
      children: [
          { id: "input", name: "InputManager", lockedBy: "Admin", lockedAt: "2024-01-01T00:00:00Z" },
          { id: "tags", name: "TagsAndLayers", lockedBy: "Admin", lockedAt: "2024-01-01T00:00:00Z" }
      ]
  }
];