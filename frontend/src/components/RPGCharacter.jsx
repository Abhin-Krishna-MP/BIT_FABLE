import { useState, useEffect } from 'react';
import { Palette, Crown, Star, Zap, Trophy, Gem } from 'lucide-react';

const RPGCharacter = ({ userLevel = 1, userXP = 0, onColorChange }) => {
  const [characterColors, setCharacterColors] = useState(() => {
    const saved = localStorage.getItem('rpgCharacterColors');
    return saved ? JSON.parse(saved) : {
      cape: '#1e40af', // Blue cape
      trim: '#fbbf24', // Gold trim
      shirt: '#f3f4f6', // Light gray shirt
      pants: '#92400e', // Brown pants
      boots: '#78350f', // Dark brown boots
      belt: '#92400e', // Brown belt
      buckle: '#fbbf24' // Gold buckle
    };
  });
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Character evolution based on level
  const getCharacterTier = (level) => {
    if (level >= 50) return 'legendary';
    if (level >= 30) return 'epic';
    if (level >= 20) return 'rare';
    if (level >= 10) return 'uncommon';
    return 'common';
  };

  const getCharacterFeatures = (level) => {
    const tier = getCharacterTier(level);
    const features = {
      common: { crown: false, aura: false, wings: false, weapon: false, armor: false },
      uncommon: { crown: false, aura: false, wings: false, weapon: false, armor: true },
      rare: { crown: false, aura: true, wings: false, weapon: true, armor: true },
      epic: { crown: true, aura: true, wings: false, weapon: true, armor: true },
      legendary: { crown: true, aura: true, wings: true, weapon: true, armor: true }
    };
    return features[tier];
  };

  const handleColorChange = (part, color) => {
    const newColors = { ...characterColors, [part]: color };
    setCharacterColors(newColors);
    if (onColorChange) {
      onColorChange(newColors);
    }
  };

  const features = getCharacterFeatures(userLevel);
  const tier = getCharacterTier(userLevel);

  return (
    <div className="rpg-character-container">
      <div className="character-header">
        <h3>Your Character</h3>
        <button 
          className="customize-btn"
          onClick={() => setShowColorPicker(!showColorPicker)}
        >
          <Palette size={16} />
          Customize
        </button>
      </div>

      <div className="character-display">
        <div className={`character-sprite tier-${tier}`}>
          {/* Character Body */}
          <div className="character-body">
            {/* Head */}
            <div className="character-head">
              <div className="hair"></div>
              <div className="eyes">
                <div className="eye left"></div>
                <div className="eye right"></div>
              </div>
              <div className="mouth"></div>
            </div>

            {/* Cape */}
            <div 
              className="character-cape"
              style={{ backgroundColor: characterColors.cape }}
            >
              <div 
                className="cape-trim"
                style={{ backgroundColor: characterColors.trim }}
              ></div>
            </div>

            {/* Shirt */}
            <div 
              className="character-shirt"
              style={{ backgroundColor: characterColors.shirt }}
            ></div>

            {/* Belt */}
            <div className="character-belt">
              <div 
                className="belt-strap"
                style={{ backgroundColor: characterColors.belt }}
              ></div>
              <div 
                className="belt-buckle"
                style={{ backgroundColor: characterColors.buckle }}
              ></div>
            </div>

            {/* Pants */}
            <div 
              className="character-pants"
              style={{ backgroundColor: characterColors.pants }}
            ></div>

            {/* Boots */}
            <div 
              className="character-boots"
              style={{ backgroundColor: characterColors.boots }}
            ></div>

            {/* Evolution Features */}
            {features.crown && (
              <div className="character-crown">
                <Crown size={12} />
              </div>
            )}
            
            {features.aura && (
              <div className="character-aura">
                <Star size={10} />
              </div>
            )}

            {features.wings && (
              <div className="character-wings">
                <Zap size={10} />
              </div>
            )}

            {features.weapon && (
              <div className="character-weapon">
                <Trophy size={10} />
              </div>
            )}

            {features.armor && (
              <div className="character-armor">
                <Gem size={10} />
              </div>
            )}
          </div>
        </div>

        <div className="character-info">
          <div className="character-level">
            <span className="level-label">Level {userLevel}</span>
            <span className={`tier-badge tier-${tier}`}>{tier.toUpperCase()}</span>
          </div>
          <div className="character-xp">
            <span className="xp-label">XP: {userXP}</span>
          </div>
        </div>
      </div>

      {/* Color Customization Panel */}
      {showColorPicker && (
        <div className="color-customization">
          <h4>Customize Colors</h4>
          <div className="color-grid">
            <div className="color-item">
              <label>Cape</label>
              <input
                type="color"
                value={characterColors.cape}
                onChange={(e) => handleColorChange('cape', e.target.value)}
              />
            </div>
            <div className="color-item">
              <label>Trim</label>
              <input
                type="color"
                value={characterColors.trim}
                onChange={(e) => handleColorChange('trim', e.target.value)}
              />
            </div>
            <div className="color-item">
              <label>Shirt</label>
              <input
                type="color"
                value={characterColors.shirt}
                onChange={(e) => handleColorChange('shirt', e.target.value)}
              />
            </div>
            <div className="color-item">
              <label>Pants</label>
              <input
                type="color"
                value={characterColors.pants}
                onChange={(e) => handleColorChange('pants', e.target.value)}
              />
            </div>
            <div className="color-item">
              <label>Boots</label>
              <input
                type="color"
                value={characterColors.boots}
                onChange={(e) => handleColorChange('boots', e.target.value)}
              />
            </div>
            <div className="color-item">
              <label>Belt</label>
              <input
                type="color"
                value={characterColors.belt}
                onChange={(e) => handleColorChange('belt', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RPGCharacter; 