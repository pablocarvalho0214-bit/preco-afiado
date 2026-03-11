import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('Testando select em perfis...');
    const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .limit(1);

    console.log('Resultado Select:', { data, error });

    if (error) {
        console.error('Erro na tabela perfis! Pode não existir ou não ter permissão.');
    } else if (data && data.length > 0) {
        console.log('Colunas existentes:', Object.keys(data[0]));
    }
}

test();
