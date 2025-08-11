import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  HelpCircle,
  Play,
  SkipForward,
  Eye,
  EyeOff 
} from "lucide-react";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  position: 'top' | 'bottom' | 'left' | 'right';
  action?: string;
  validationCheck?: () => boolean;
}

interface TutorialOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Добро пожаловать в создание ассистента!',
    description: 'Мы проведем вас через простой процесс создания вашего первого AI-ассистента. Это займет всего несколько минут.',
    targetSelector: '.assistant-config-panel',
    position: 'top'
  },
  {
    id: 'name',
    title: 'Дайте имя вашему ассистенту',
    description: 'Выберите понятное имя, которое отражает назначение ассистента. Например: "Помощник по продажам" или "Консультант".',
    targetSelector: 'input[placeholder*="Введите название"]',
    position: 'bottom',
    action: 'type',
    validationCheck: () => {
      const input = document.querySelector('input[placeholder*="Введите название"]') as HTMLInputElement;
      return input?.value.length > 0;
    }
  },
  {
    id: 'description',
    title: 'Опишите ассистента',
    description: 'Краткое описание поможет вам и другим понять, для чего предназначен этот ассистент.',
    targetSelector: 'textarea[placeholder*="Опишите вашего ассистента"]',
    position: 'bottom',
    action: 'type',
    validationCheck: () => {
      const textarea = document.querySelector('textarea[placeholder*="Опишите вашего ассистента"]') as HTMLTextAreaElement;
      return textarea?.value.length > 10;
    }
  },
  {
    id: 'model',
    title: 'Выберите модель AI',
    description: 'GPT-4o - это рекомендуемая модель с лучшей производительностью. Для экономии можно использовать GPT-3.5.',
    targetSelector: '[data-tutorial="model-select"]',
    position: 'right'
  },
  {
    id: 'instructions',
    title: 'Настройте инструкции',
    description: 'Здесь вы можете задать поведение ассистента. Опишите, как он должен отвечать и какие задачи выполнять.',
    targetSelector: 'textarea[placeholder*="Введите инструкции"]',
    position: 'top',
    action: 'type'
  },
  {
    id: 'tools',
    title: 'Включите необходимые инструменты',
    description: 'Активируйте дополнительные возможности: анализ кода, поиск по файлам или веб-поиск.',
    targetSelector: '[data-tutorial="tools-section"]',
    position: 'left'
  },
  {
    id: 'save',
    title: 'Сохраните ассистента',
    description: 'Нажмите кнопку "Сохранить", чтобы создать ассистента. После этого вы сможете начать с ним общение!',
    targetSelector: 'button[data-tutorial="save-button"]',
    position: 'top',
    action: 'click'
  }
];

export function TutorialOverlay({ isVisible, onClose, onComplete }: TutorialOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [highlightElement, setHighlightElement] = useState<Element | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

  const currentStepData = TUTORIAL_STEPS[currentStep];
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

  useEffect(() => {
    if (!isVisible) return;

    const updateHighlight = () => {
      if (currentStepData?.targetSelector) {
        const element = document.querySelector(currentStepData.targetSelector);
        if (element) {
          setHighlightElement(element);
          
          const rect = element.getBoundingClientRect();
          const tooltipWidth = 350;
          const tooltipHeight = 200;
          
          let top = rect.top;
          let left = rect.left;

          switch (currentStepData.position) {
            case 'top':
              top = rect.top - tooltipHeight - 20;
              left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
              break;
            case 'bottom':
              top = rect.bottom + 20;
              left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
              break;
            case 'left':
              top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
              left = rect.left - tooltipWidth - 20;
              break;
            case 'right':
              top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
              left = rect.right + 20;
              break;
          }

          // Убедимся, что тултип не выходит за границы экрана
          top = Math.max(20, Math.min(top, window.innerHeight - tooltipHeight - 20));
          left = Math.max(20, Math.min(left, window.innerWidth - tooltipWidth - 20));

          setTooltipPosition({ top, left });
        }
      }
    };

    updateHighlight();
    window.addEventListener('resize', updateHighlight);
    
    return () => {
      window.removeEventListener('resize', updateHighlight);
    };
  }, [currentStep, isVisible]);

  const nextStep = () => {
    // Проверяем валидацию текущего шага
    if (currentStepData?.validationCheck && !currentStepData.validationCheck()) {
      return;
    }

    setCompletedSteps(prev => new Set([...prev, currentStepData.id]));
    
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTutorial = () => {
    onClose();
  };

  const handleComplete = () => {
    setCompletedSteps(new Set([...TUTORIAL_STEPS.map(step => step.id)]));
    onComplete();
    onClose();
  };

  const canProceed = () => {
    if (!currentStepData?.validationCheck) return true;
    return currentStepData.validationCheck();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay с затемнением */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* Подсветка целевого элемента */}
      {highlightElement && (
        <div
          className="absolute border-4 border-blue-500 rounded-lg shadow-lg animate-pulse"
          style={{
            top: highlightElement.getBoundingClientRect().top - 4,
            left: highlightElement.getBoundingClientRect().left - 4,
            width: highlightElement.getBoundingClientRect().width + 8,
            height: highlightElement.getBoundingClientRect().height + 8,
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Тултип с инструкциями */}
      <Card 
        className="absolute w-[350px] bg-white dark:bg-gray-900 shadow-2xl border-2 border-blue-500"
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs">
              Шаг {currentStep + 1} из {TUTORIAL_STEPS.length}
            </Badge>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={skipTutorial}
                className="text-gray-500 hover:text-gray-700"
              >
                <SkipForward className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <Progress value={progress} className="w-full h-2" />
          
          <CardTitle className="text-lg flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-500" />
            {currentStepData.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {currentStepData.description}
          </p>
          
          {currentStepData.action && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <p className="text-xs text-blue-700 dark:text-blue-400 flex items-center gap-2">
                <Play className="w-3 h-3" />
                {currentStepData.action === 'type' && 'Введите информацию в поле выше'}
                {currentStepData.action === 'click' && 'Нажмите на выделенный элемент'}
              </p>
            </div>
          )}

          {!canProceed() && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
              <p className="text-xs text-yellow-700 dark:text-yellow-400">
                Заполните поле, чтобы продолжить
              </p>
            </div>
          )}

          <div className="flex justify-between">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад
            </Button>
            
            <Button 
              size="sm" 
              onClick={nextStep}
              disabled={!canProceed()}
              className="flex items-center gap-2"
            >
              {currentStep === TUTORIAL_STEPS.length - 1 ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Завершить
                </>
              ) : (
                <>
                  Далее
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}