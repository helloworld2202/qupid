import React from 'react';
import { ArrowLeftIcon } from '@qupid/ui';

interface DesignGuideScreenProps {
  onBack: () => void;
}

const ColorPalette: React.FC<{ title: string; colors: { name: string; value: string; }[] }> = ({ title, colors }) => (
  <div className="mb-6">
    <h3 className="text-lg font-bold mb-3">{title}</h3>
    <div className="flex flex-wrap gap-3">
      {colors.map(color => (
        <div key={color.name} className="text-center">
          <div 
            className="w-16 h-16 rounded-lg mb-1 border border-gray-200" 
            style={{ backgroundColor: color.value }}
          />
          <p className="text-xs font-medium">{color.name}</p>
          <p className="text-xs text-gray-500">{color.value}</p>
        </div>
      ))}
    </div>
  </div>
);

const TypographyExample: React.FC<{ name: string; className: string; text: string }> = ({ name, className, text }) => (
  <div className="mb-4">
    <p className="text-xs text-gray-500 mb-1">{name}</p>
    <p className={className}>{text}</p>
  </div>
);

const ComponentExample: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h4 className="text-base font-semibold mb-3">{title}</h4>
    <div className="p-4 bg-gray-50 rounded-lg">
      {children}
    </div>
  </div>
);

const DesignGuideScreen: React.FC<DesignGuideScreenProps> = ({ onBack }) => {
  const primaryColors = [
    { name: 'Pink Main', value: '#F093B0' },
    { name: 'Pink Light', value: '#FDF2F8' },
    { name: 'Blue Main', value: '#4F7ABA' },
    { name: 'Blue Light', value: '#EBF2FF' },
  ];

  const semanticColors = [
    { name: 'Success', value: '#0AC5A8' },
    { name: 'Warning', value: '#FF9500' },
    { name: 'Error', value: '#FF3B30' },
    { name: 'Info', value: '#5856D6' },
  ];

  const neutralColors = [
    { name: 'Black', value: '#191F28' },
    { name: 'Gray 700', value: '#4B5563' },
    { name: 'Gray 500', value: '#8B95A1' },
    { name: 'Gray 300', value: '#D1D5DB' },
    { name: 'Gray 100', value: '#F2F4F6' },
    { name: 'White', value: '#FFFFFF' },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-white">
      <header className="flex-shrink-0 flex items-center justify-between p-3 bg-white border-b">
        <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
          <ArrowLeftIcon className="w-6 h-6 text-[#191F28]" />
        </button>
        <h1 className="text-xl font-bold text-[#191F28]">디자인 가이드</h1>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        {/* Colors */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Colors</h2>
          <ColorPalette title="Primary Colors" colors={primaryColors} />
          <ColorPalette title="Semantic Colors" colors={semanticColors} />
          <ColorPalette title="Neutral Colors" colors={neutralColors} />
        </section>

        {/* Typography */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Typography</h2>
          <TypographyExample 
            name="Heading 1" 
            className="text-2xl font-bold text-[#191F28]" 
            text="큐피드와 함께 연애 연습"
          />
          <TypographyExample 
            name="Heading 2" 
            className="text-xl font-bold text-[#191F28]" 
            text="AI와 대화하며 성장하기"
          />
          <TypographyExample 
            name="Body Large" 
            className="text-base font-medium text-[#191F28]" 
            text="안녕하세요! 오늘은 어떤 대화를 나눠볼까요?"
          />
          <TypographyExample 
            name="Body Regular" 
            className="text-sm text-[#191F28]" 
            text="대화를 통해 자연스러운 소통 능력을 키워보세요."
          />
          <TypographyExample 
            name="Caption" 
            className="text-xs text-[#8B95A1]" 
            text="5분 전 · 읽음"
          />
        </section>

        {/* Components */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Components</h2>
          
          <ComponentExample title="Buttons">
            <div className="space-y-3">
              <button className="w-full py-3 bg-[#F093B0] text-white rounded-xl font-bold">
                Primary Button
              </button>
              <button className="w-full py-3 bg-[#EBF2FF] text-[#4F7ABA] rounded-xl font-bold">
                Secondary Button
              </button>
              <button className="w-full py-3 border border-[#D1D5DB] text-[#191F28] rounded-xl font-bold">
                Outline Button
              </button>
            </div>
          </ComponentExample>

          <ComponentExample title="Cards">
            <div className="bg-white rounded-2xl border border-[#F2F4F6] p-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-[#F093B0] rounded-full"></div>
                <div className="ml-3">
                  <p className="font-bold">Card Title</p>
                  <p className="text-sm text-[#8B95A1]">Card subtitle</p>
                </div>
              </div>
            </div>
          </ComponentExample>

          <ComponentExample title="Tags">
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-[#FDF2F8] text-[#F093B0] text-sm font-medium rounded-full">
                #연애초보
              </span>
              <span className="px-3 py-1 bg-[#EBF2FF] text-[#4F7ABA] text-sm font-medium rounded-full">
                #대화연습
              </span>
              <span className="px-3 py-1 bg-[#E6F7F5] text-[#0AC5A8] text-sm font-medium rounded-full">
                #성공
              </span>
            </div>
          </ComponentExample>
        </section>

        {/* Spacing */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Spacing</h2>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-20 text-sm text-gray-500">4px</div>
              <div className="h-4 bg-[#F093B0]" style={{ width: '16px' }}></div>
            </div>
            <div className="flex items-center">
              <div className="w-20 text-sm text-gray-500">8px</div>
              <div className="h-4 bg-[#F093B0]" style={{ width: '32px' }}></div>
            </div>
            <div className="flex items-center">
              <div className="w-20 text-sm text-gray-500">12px</div>
              <div className="h-4 bg-[#F093B0]" style={{ width: '48px' }}></div>
            </div>
            <div className="flex items-center">
              <div className="w-20 text-sm text-gray-500">16px</div>
              <div className="h-4 bg-[#F093B0]" style={{ width: '64px' }}></div>
            </div>
            <div className="flex items-center">
              <div className="w-20 text-sm text-gray-500">24px</div>
              <div className="h-4 bg-[#F093B0]" style={{ width: '96px' }}></div>
            </div>
            <div className="flex items-center">
              <div className="w-20 text-sm text-gray-500">32px</div>
              <div className="h-4 bg-[#F093B0]" style={{ width: '128px' }}></div>
            </div>
          </div>
        </section>

        {/* Animations */}
        <section className="mb-8 pb-8">
          <h2 className="text-2xl font-bold mb-4">Animations</h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-[#F093B0] rounded-lg animate-pulse mb-2"></div>
              <p className="text-sm">Pulse Animation</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-[#4F7ABA] rounded-lg animate-bounce mb-2"></div>
              <p className="text-sm">Bounce Animation</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="w-16 h-16 bg-[#0AC5A8] rounded-lg animate-spin mb-2"></div>
              <p className="text-sm">Spin Animation</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export { DesignGuideScreen };
export default DesignGuideScreen;