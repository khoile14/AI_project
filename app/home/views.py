from django.shortcuts import render
from django.http import JsonResponse
from transformers import AutoTokenizer, AutoModelForCausalLM, GPT2LMHeadModel, GPT2Tokenizer
from dotenv import load_dotenv, find_dotenv
import time
import torch

load_dotenv(find_dotenv())

models = {
    "a" : "microsoft/DialoGPT-medium",
    "b" : "gpt2",
}

def response(request):
    text = request.POST.get('user_input', 'No input provided')
    model_id = request.POST.get('mdls', 'a')

    model_name = models[model_id]

    start_time = time.time()
    if model_name == 'gpt2':
        tokenizer = GPT2Tokenizer.from_pretrained(model_name, padding_side='left')
        model = GPT2LMHeadModel.from_pretrained(model_name)
        encoded_input = tokenizer(text, return_tensors='pt')
        attention_mask = encoded_input['attention_mask']
        output = model.generate(encoded_input['input_ids'], attention_mask=attention_mask, pad_token_id=tokenizer.eos_token_id, max_length = 50)
        response_text = tokenizer.decode(output[0], skip_special_tokens=True)
    else:
        tokenizer = AutoTokenizer.from_pretrained(model_name, padding_side='left')
        model = AutoModelForCausalLM.from_pretrained(model_name)
        new_user_input_ids = tokenizer.encode(text + tokenizer.eos_token, return_tensors='pt')
        chat_history_ids = model.generate(new_user_input_ids, max_length=1000, pad_token_id=tokenizer.eos_token_id)
        response_text = tokenizer.decode(chat_history_ids[:, new_user_input_ids.shape[-1]:][0], skip_special_tokens=True)

    end_time = time.time()
    report_time = end_time - start_time

    return JsonResponse({'answer': response_text, 'response_time': report_time})

def home(request):
    if request.method == 'POST':
        response_json = response(request)
        return response_json
    else:
        return render(request, 'index.html')
