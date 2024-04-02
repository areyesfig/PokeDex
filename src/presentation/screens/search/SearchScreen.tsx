import React, { useMemo, useState } from 'react'
import { FlatList, Text, View } from 'react-native'
import { ActivityIndicator, TextInput } from 'react-native-paper'
import { globalTheme } from '../../../config/theme/global-theme'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useQuery } from '@tanstack/react-query'
import { getPokemonNamesWithId } from '../../../actions/pokemons'
import { PokemonCard } from '../../components/pokemons/PokemonCard'
import { getPokemonsByIds } from '../../../actions/pokemons/get-pokemon-by-ids'
import { FullScreenLoader } from '../../components/ui/FullScreenLoader'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'

export const SearchScreen = () => {
  
 const { top } = useSafeAreaInsets();
 const [term, setTerm] = useState('');

 const debouncedValue = useDebouncedValue(term);


 const { isLoading , data: pokemonNameList = []} = useQuery({
    queryKey: ['pokemon','all'],
    queryFn: () => getPokemonNamesWithId()

 });

 const pokemonNameIdList = useMemo(() => {

    if(!isNaN(Number(debouncedValue))){
        const pokemon = pokemonNameList.find(pokemon => pokemon.id === Number(debouncedValue));
        return pokemon ? [pokemon] : [];

    }

    if(debouncedValue.length === 0) return [];
    if(debouncedValue.length < 3) return [];
    return pokemonNameList.filter(pokemon => pokemon.name.toLocaleLowerCase().includes(debouncedValue.toLocaleLowerCase()),
    );
 }, [debouncedValue]);


    const { isLoading:isLoadingPokemons, data: pokemons = []} = useQuery({
        queryKey: ['pokemon','by', pokemonNameIdList],
        queryFn: () => getPokemonsByIds(pokemonNameIdList.map(pokemon=> pokemon.id)),
        staleTime: 1000 * 60 * 5,

    });

    if( isLoading ) return <FullScreenLoader/>

  
    return (
    <View style={[ globalTheme.globalMargin,{padding: top + 10}]}>
        <TextInput
            placeholder="Buscar Pokemon"
            mode="flat"
            autoFocus
            autoCorrect={false}
            value={term}
            onChangeText={setTerm}
            />

        {
            isLoadingPokemons &&  <ActivityIndicator style={{ paddingTop: 20 }}/>
        }
       


        <FlatList 
            data={ pokemons}
            keyExtractor={( pokemon,index) => `${pokemon.id}- ${index}`}
            numColumns={2}
            style={{paddingTop: top + 20}}
            renderItem={({item}) => <PokemonCard pokemon={ item }/>}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={ <View style={{ height: 100}}/>}/>

        
    </View>
  )
}
