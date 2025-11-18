import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('🐉 Начинаем загрузку монстров из D&D API...')

    // Получаем список монстров
    const monstersResponse = await fetch('https://www.dnd5eapi.co/api/2014/monsters/')
    const monstersData = await monstersResponse.json()
    
    if (!monstersData.results) {
      throw new Error('Не удалось получить список монстров')
    }

    console.log(`📝 Найдено ${monstersData.results.length} монстров`)

    let imported = 0
    let errors = 0

    // Обрабатываем каждого монстра
    for (const monster of monstersData.results) {
      try {
        // Получаем детальную информацию о монстре
        const detailResponse = await fetch(`https://www.dnd5eapi.co${monster.url}`)
        const detail = await detailResponse.json()

        // Преобразуем данные в формат нашей таблицы
        const monsterData = {
          slug: detail.index,
          name: detail.name,
          type: detail.type,
          size: detail.size?.toLowerCase() || 'medium',
          alignment: detail.alignment,
          armor_class: detail.armor_class?.[0]?.value || 10,
          hit_points: detail.hit_points || 1,
          hit_dice: detail.hit_dice,
          speed: detail.speed ? {
            walk: detail.speed.walk?.split(' ')[0] || 30,
            fly: detail.speed.fly?.split(' ')[0] || null,
            swim: detail.speed.swim?.split(' ')[0] || null,
            burrow: detail.speed.burrow?.split(' ')[0] || null
          } : { walk: 30 },
          stats: {
            strength: detail.strength || 10,
            dexterity: detail.dexterity || 10,
            constitution: detail.constitution || 10,
            intelligence: detail.intelligence || 10,
            wisdom: detail.wisdom || 10,
            charisma: detail.charisma || 10
          },
          saves: detail.saving_throws ? detail.saving_throws.reduce((acc: any, save: any) => {
            acc[save.name.toLowerCase().replace('dex', 'dexterity').replace('con', 'constitution').replace('int', 'intelligence').replace('wis', 'wisdom').replace('cha', 'charisma').replace('str', 'strength')] = save.value
            return acc
          }, {}) : null,
          skills: detail.skills ? detail.skills.reduce((acc: any, skill: any) => {
            acc[skill.name.toLowerCase().replace(' ', '_')] = skill.value
            return acc
          }, {}) : null,
          senses: detail.senses ? Object.entries(detail.senses).map(([key, value]) => `${key} ${value}`).join(', ') : null,
          languages: detail.languages || null,
          cr: detail.challenge_rating || 0,
          actions: detail.actions || null,
          traits: detail.special_abilities || null,
          legendary_actions: detail.legendary_actions || null,
          reactions: detail.reactions || null
        }

        // Вставляем в базу данных
        const { error } = await supabaseClient
          .from('srd_creatures')
          .upsert([monsterData], { 
            onConflict: 'slug',
            ignoreDuplicates: false 
          })

        if (error) {
          console.error(`❌ Ошибка вставки ${monster.name}:`, error)
          errors++
        } else {
          imported++
          if (imported % 10 === 0) {
            console.log(`📈 Импортировано ${imported} монстров...`)
          }
        }

        // Небольшая задержка чтобы не перегружать API
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        console.error(`❌ Ошибка обработки ${monster.name}:`, error)
        errors++
      }
    }

    console.log(`✅ Импорт завершен! Успешно: ${imported}, Ошибок: ${errors}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        imported, 
        errors,
        message: `Импортировано ${imported} монстров, ${errors} ошибок` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('❌ Критическая ошибка:', error)
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})