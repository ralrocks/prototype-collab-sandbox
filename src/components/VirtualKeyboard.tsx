
import React from 'react';

const VirtualKeyboard: React.FC = () => {
  return (
    <div className="keyboard-container bg-gray-200 pt-1">
      <div className="keyboard-row">
        <div className="key bg-white rounded shadow-sm">Q</div>
        <div className="key bg-white rounded shadow-sm">W</div>
        <div className="key bg-white rounded shadow-sm">E</div>
        <div className="key bg-white rounded shadow-sm">R</div>
        <div className="key bg-white rounded shadow-sm">T</div>
        <div className="key bg-white rounded shadow-sm">Y</div>
        <div className="key bg-white rounded shadow-sm">U</div>
        <div className="key bg-white rounded shadow-sm">I</div>
        <div className="key bg-white rounded shadow-sm">O</div>
        <div className="key bg-white rounded shadow-sm">P</div>
      </div>
      <div className="keyboard-row">
        <div className="key bg-white rounded shadow-sm">A</div>
        <div className="key bg-white rounded shadow-sm">S</div>
        <div className="key bg-white rounded shadow-sm">D</div>
        <div className="key bg-white rounded shadow-sm">F</div>
        <div className="key bg-white rounded shadow-sm">G</div>
        <div className="key bg-white rounded shadow-sm">H</div>
        <div className="key bg-white rounded shadow-sm">J</div>
        <div className="key bg-white rounded shadow-sm">K</div>
        <div className="key bg-white rounded shadow-sm">L</div>
      </div>
      <div className="keyboard-row">
        <div className="key bg-white rounded shadow-sm">Z</div>
        <div className="key bg-white rounded shadow-sm">X</div>
        <div className="key bg-white rounded shadow-sm">C</div>
        <div className="key bg-white rounded shadow-sm">V</div>
        <div className="key bg-white rounded shadow-sm">B</div>
        <div className="key bg-white rounded shadow-sm">N</div>
        <div className="key bg-white rounded shadow-sm">M</div>
        <div className="key bg-white rounded shadow-sm">&lt;</div>
      </div>
      <div className="keyboard-row">
        <div className="key key-special bg-white rounded shadow-sm">123</div>
        <div className="key bg-white rounded shadow-sm">@</div>
        <div className="key key-space bg-white rounded shadow-sm">space</div>
        <div className="key key-special bg-white rounded shadow-sm">return</div>
      </div>
    </div>
  );
};

export default VirtualKeyboard;
